import { NextRequest, NextResponse } from "next/server";

const internalApiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:5000";
const backendTimeoutMs = 10000;
const forwardedHeaders = [
  "Retry-After",
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
  "RateLimit-Limit",
  "RateLimit-Remaining",
  "RateLimit-Reset"
];

function copyRateLimitHeaders(response: Response) {
  const headers = new Headers();

  for (const header of forwardedHeaders) {
    const value = response.headers.get(header);
    if (value) headers.set(header, value);
  }

  return headers;
}

async function fetchBackend(input: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), backendTimeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The bug report request was not valid JSON."
      },
      { status: 400 }
    );
  }

  let response: Response;

  try {
    response = await fetchBackend(`${internalApiUrl}/api/bug-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "PhishGuard cannot reach the bug report service. Please try again later."
      },
      { status: 503 }
    );
  }

  try {
    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: copyRateLimitHeaders(response)
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The bug report service responded, but PhishGuard could not read the response."
      },
      { status: 502 }
    );
  }
}
