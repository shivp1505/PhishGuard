import { NextResponse } from "next/server";

export const maxDuration = 60;

const internalApiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:5000";
const backendTimeoutMs = 55000;

async function fetchBackendHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), backendTimeoutMs);

  try {
    return await fetch(`${internalApiUrl}/health`, {
      cache: "no-store",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  try {
    const response = await fetchBackendHealth();

    if (!response.ok) {
      throw new Error("Backend health check failed.");
    }

    const data = await response.json();
    return NextResponse.json({
      online: true,
      status: data.status ?? "ok",
      service: data.service ?? "phishguard-backend",
      version: data.version ?? "1.0.0",
      engine: data.engine ?? "rule-based-v1",
      releaseStage: data.releaseStage ?? "V1 local",
      rulesetVersion: data.rulesetVersion ?? "ruleset-unknown",
      uiBuild: data.uiBuild ?? "v1-local",
      lastUpdated: data.lastUpdated ?? "unknown",
      metrics: data.metrics ?? null
    });
  } catch (caught) {
    const isTimeout = caught instanceof Error && caught.name === "AbortError";

    return NextResponse.json(
      {
        online: false,
        status: isTimeout ? "waking" : "offline",
        service: "phishguard-backend",
        version: "unknown",
        engine: isTimeout ? "warming" : "offline",
        releaseStage: isTimeout ? "waking" : "offline",
        rulesetVersion: "unknown",
        uiBuild: "v1-local",
        lastUpdated: "unknown",
        metrics: null,
        message: isTimeout
          ? "The backend is still waking up. Render free-tier services can take around 50 seconds after inactivity."
          : "The backend health check could not reach the analysis server."
      },
      { status: isTimeout ? 202 : 503 }
    );
  }
}
