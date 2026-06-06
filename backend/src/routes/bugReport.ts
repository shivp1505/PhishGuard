import { Router } from "express";
import { Resend } from "resend";

interface BugReportRequest {
  summary?: unknown;
  details?: unknown;
  contact?: unknown;
  page?: unknown;
  userAgent?: unknown;
}

const router = Router();

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPlainText({
  summary,
  details,
  contact,
  page,
  userAgent
}: {
  summary: string;
  details: string;
  contact: string;
  page: string;
  userAgent: string;
}) {
  return [
    "PhishGuard Bug Report",
    "",
    `Summary: ${summary}`,
    "",
    "Details:",
    details,
    "",
    `Contact: ${contact || "Not provided"}`,
    `Page: ${page || "Not provided"}`,
    `User Agent: ${userAgent || "Not provided"}`,
    "",
    "Reminder: users are instructed not to include passwords, verification codes, banking details, or sensitive message content."
  ].join("\n");
}

router.post("/", async (req, res) => {
  const body = (req.body ?? {}) as BugReportRequest;
  const summary = sanitizeText(body.summary, 120);
  const details = sanitizeText(body.details, 1500);
  const contact = sanitizeText(body.contact, 180);
  const page = sanitizeText(body.page, 300);
  const userAgent = sanitizeText(body.userAgent, 300);

  if (!summary || !details) {
    return res.status(400).json({
      success: false,
      message: "Bug summary and details are required."
    });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BUG_REPORT_TO_EMAIL;
  const fromEmail = process.env.BUG_REPORT_FROM_EMAIL ?? "PhishGuard <onboarding@resend.dev>";

  if (!resendApiKey || !toEmail) {
    return res.status(503).json({
      success: false,
      message: "Bug reporting is not configured yet."
    });
  }

  const plainText = formatPlainText({ summary, details, contact, page, userAgent });
  const html = `
    <h2>PhishGuard Bug Report</h2>
    <p><strong>Summary:</strong> ${escapeHtml(summary)}</p>
    <p><strong>Details:</strong></p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace;">${escapeHtml(details)}</pre>
    <p><strong>Contact:</strong> ${escapeHtml(contact || "Not provided")}</p>
    <p><strong>Page:</strong> ${escapeHtml(page || "Not provided")}</p>
    <p><strong>User Agent:</strong> ${escapeHtml(userAgent || "Not provided")}</p>
    <hr />
    <p>Users are instructed not to include passwords, verification codes, banking details, or sensitive message content.</p>
  `;

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: contact || undefined,
    subject: `PhishGuard bug: ${summary}`,
    text: plainText,
    html
  });

  if (error) {
    return res.status(502).json({
      success: false,
      message: "Bug report could not be sent right now."
    });
  }

  return res.json({
    success: true,
    message: "Bug report sent. Thank you for helping improve PhishGuard."
  });
});

export { router as bugReportRouter };
