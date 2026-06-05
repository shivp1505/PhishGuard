import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import helmet from "helmet";
import { systemInfo } from "./config/system";
import { createRateLimiter, RateLimitOptions } from "./middleware/rateLimit";
import { analyzeRouter } from "./routes/analyze";

interface CreateAppOptions {
  frontendUrl?: string;
  analyzeRateLimit?: RateLimitOptions;
}

function readPositiveNumber(value: string | undefined, fallback: number, options: { min: number; max: number }) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.floor(Math.min(options.max, Math.max(options.min, parsed)));
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const frontendUrl = options.frontendUrl ?? process.env.FRONTEND_URL ?? "http://localhost:3000";
  const trustProxyHops = readPositiveNumber(
    process.env.TRUST_PROXY_HOPS,
    process.env.NODE_ENV === "production" ? 1 : 0,
    { min: 0, max: 5 }
  );
  const analyzeRateLimit = options.analyzeRateLimit ?? {
    windowMs: readPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000, { min: 1_000, max: 3_600_000 }),
    maxRequests: readPositiveNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 60, { min: 1, max: 1_000 })
  };

  if (trustProxyHops > 0) {
    app.set("trust proxy", trustProxyHops);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: frontendUrl.split(",").map((origin) => origin.trim()),
      methods: ["GET", "POST"]
    })
  );
  app.use(express.json({ limit: "64kb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "phishguard-backend",
      version: systemInfo.backendVersion,
      engine: systemInfo.engine,
      releaseStage: systemInfo.releaseStage,
      rulesetVersion: systemInfo.rulesetVersion,
      uiBuild: systemInfo.uiBuild,
      lastUpdated: systemInfo.lastUpdated,
      metrics: systemInfo.metrics
    });
  });

  app.use("/api/analyze", createRateLimiter(analyzeRateLimit), analyzeRouter);

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while analyzing the message."
    });
  };

  app.use(errorHandler);

  return app;
}
