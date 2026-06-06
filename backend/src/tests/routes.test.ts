import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { createApp } from "../app";

async function test(name: string, run: () => Promise<void>) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = createApp({
    frontendUrl: "http://localhost:3000",
    analyzeRateLimit: {
      windowMs: 60_000,
      maxRequests: 2
    }
  });
  const server = app.listen(0);
  const address = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

export async function runRouteTests() {
  await test("health route reports backend status", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/health`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.status, "ok");
      assert.equal(body.service, "phishguard-backend");
    });
  });

  await test("analyze route returns a phishing assessment", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: "security@example.com",
          subject: "Urgent account check",
          message: "Please verify your account immediately."
        })
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.riskScore > 0);
    });
  });

  await test("analyze route validates required message body", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: "security@example.com"
        })
      });
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.success, false);
      assert.equal(body.message, "Message body is required.");
    });
  });

  await test("analyze route rate limits repeated requests", async () => {
    await withServer(async (baseUrl) => {
      const request = () =>
        fetch(`${baseUrl}/api/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: "Hello"
          })
        });

      assert.equal((await request()).status, 200);
      assert.equal((await request()).status, 200);

      const limited = await request();
      const body = await limited.json();

      assert.equal(limited.status, 429);
      assert.equal(body.success, false);
      assert.ok(limited.headers.get("Retry-After"));
      assert.equal(limited.headers.get("X-RateLimit-Limit"), "2");
      assert.equal(limited.headers.get("X-RateLimit-Remaining"), "0");
      assert.equal(limited.headers.get("RateLimit-Limit"), "2");
    });
  });

  await test("bug report route validates required fields", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/bug-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: "Missing details"
        })
      });
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.success, false);
      assert.equal(body.message, "Bug summary and details are required.");
    });
  });
}
