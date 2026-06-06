import { RequestHandler } from "express";
import { ErrorResponse } from "../types/analysis";

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface ClientWindow {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimitOptions): RequestHandler<unknown, ErrorResponse> {
  const clients = new Map<string, ClientWindow>();
  let requestsSinceCleanup = 0;
  const maxTrackedClients = 5000;

  function cleanupExpiredWindows(now: number) {
    requestsSinceCleanup += 1;
    if (requestsSinceCleanup < 100) return;

    requestsSinceCleanup = 0;
    for (const [key, value] of clients.entries()) {
      if (value.resetAt <= now) clients.delete(key);
    }

    while (clients.size > maxTrackedClients) {
      const oldestKey = clients.keys().next().value;
      if (!oldestKey) break;
      clients.delete(oldestKey);
    }
  }

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = clients.get(key);
    cleanupExpiredWindows(now);

    if (!current || current.resetAt <= now) {
      const resetAt = now + options.windowMs;
      clients.set(key, {
        count: 1,
        resetAt
      });
      res.setHeader("X-RateLimit-Limit", String(options.maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(options.maxRequests - 1));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
      res.setHeader("RateLimit-Limit", String(options.maxRequests));
      res.setHeader("RateLimit-Remaining", String(options.maxRequests - 1));
      res.setHeader("RateLimit-Reset", String(Math.ceil(options.windowMs / 1000)));
      next();
      return;
    }

    current.count += 1;
    const remaining = Math.max(0, options.maxRequests - current.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

    res.setHeader("X-RateLimit-Limit", String(options.maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));
    res.setHeader("RateLimit-Limit", String(options.maxRequests));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(retryAfterSeconds));

    if (current.count > options.maxRequests) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        success: false,
        message: "Too many scan requests. Please wait a moment and try again."
      });
      return;
    }

    next();
  };
}
