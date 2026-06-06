# PhishGuard

PhishGuard is a cybersecurity awareness web app that analyzes suspicious messages for common phishing indicators and provides a risk score, explanations, and recommended next steps.

Version 1 uses rule-based detection and local domain intelligence, so it works locally without a paid API key, user accounts, a database, or AI integration.

Live app: https://phishguard.shivpatel.net

Repository: https://github.com/shivp1505/PhishGuard

## Features

- Message scanner for emails, SMS messages, direct messages, and suspicious links
- Rule-based phishing analysis
- Trusted-domain context for common services like Zoom, Google, Microsoft, GitHub, DocuSign, Slack, Canvas, Rutgers, and PayPal
- Lookalike-domain detection for suspicious brand impersonation
- Risk score from 0 to 100
- Risk levels: Low, Medium, High, Critical
- Verdict, confidence, evidence strength, and "what was not found" explanations
- Detected indicators with matched text
- Plain-language explanations
- Recommended next steps
- Sample phishing and low-risk messages
- Copyable scan report
- Dedicated report view with copy/export
- In-app bug reporting with Resend email delivery
- Responsive dark cybersecurity dashboard UI
- Local-first setup with no backend message storage
- Optional browser-only scan history, disabled by default

## Tech Stack

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

Backend:

- Node.js
- Express.js
- TypeScript
- CORS
- Helmet

## Project Structure

```text
PhishGuard/
  frontend/
    app/
    components/
    lib/
  backend/
    src/
      data/
      middleware/
      routes/
      services/
      types/
```

## Local Setup

Install dependencies for each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create environment files:

```bash
cd backend
copy .env.example .env

cd ../frontend
copy .env.example .env.local
```

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Frontend:

```text
NEXT_PUBLIC_API_URL=
INTERNAL_API_URL=http://localhost:5000
NEXT_PUBLIC_BUG_REPORT_EMAIL=bugs@shivpatel.net
```

Leave `NEXT_PUBLIC_API_URL` blank for normal local or LAN testing. The frontend will call its own `/api/analyze` route, and Next.js will proxy requests to the backend through `INTERNAL_API_URL`.

Backend:

```text
PORT=5000
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_WINDOW_MS=60000
TRUST_PROXY_HOPS=1
RESEND_API_KEY=
BUG_REPORT_TO_EMAIL=bugs@yourdomain.com
BUG_REPORT_FROM_EMAIL=PhishGuard <onboarding@resend.dev>
BUG_REPORT_RATE_LIMIT_MAX_REQUESTS=5
BUG_REPORT_RATE_LIMIT_WINDOW_MS=300000
```

For production, set `INTERNAL_API_URL` to the deployed backend URL and set `FRONTEND_URL` on the backend to the deployed frontend URL. If the backend runs behind a proxy such as Render, keep `TRUST_PROXY_HOPS=1` so rate limiting uses the correct client IP.

Bug reports are sent through Resend from the backend. Keep `RESEND_API_KEY` only in the backend hosting environment. For production sending, use a verified sending domain in Resend and set `BUG_REPORT_FROM_EMAIL` to an address on that domain.

## API

### POST `/api/analyze`

Request body:

```json
{
  "sender": "security@example.com",
  "subject": "Final warning",
  "message": "Dear customer, verify your account immediately...",
  "url": "http://bit.ly/example"
}
```

Successful response:

```json
{
  "success": true,
  "riskScore": 82,
  "riskLevel": "High",
  "verdict": "High risk phishing indicators",
  "confidence": "High",
  "evidenceStrength": "Strong evidence",
  "summary": "This message is rated High risk because it contains urgency, credential request, and suspicious link.",
  "indicators": [
    {
      "type": "Urgency",
      "severity": "Medium",
      "description": "The message uses time pressure to push the reader into acting quickly.",
      "matches": ["immediately"],
      "score": 15
    }
  ],
  "notFound": ["No attachment download request found"],
  "recommendations": [
    "Do not click links or download attachments in this message.",
    "Verify the sender through an official website, phone number, or trusted contact method."
  ]
}
```

Error response:

```json
{
  "success": false,
  "message": "Message body is required."
}
```

## How Scoring Works

PhishGuard checks for indicators such as:

- Urgent language
- Credential requests
- Financial pressure
- Suspicious links
- Generic greetings
- Attachment requests
- Social engineering language
- Too-good-to-be-true offers
- Sender and link domain mismatch
- Trusted service links
- Brand lookalikes such as typo domains

Risk indicators add to the score. Context-only signals, such as a recognized Zoom link, can appear with a `+0` score so users understand why the app did not over-penalize a common service domain. The final score is capped at 100.

Risk levels:

- 0-24: Low
- 25-49: Medium
- 50-74: High
- 75-100: Critical

## Disclaimer

PhishGuard is an educational tool designed to help users recognize common phishing indicators. It is not a replacement for professional cybersecurity software, email filtering systems, or expert analysis.

Even though nothing is stored in the back end, avoid entering real passwords, Social Security numbers, banking details, or other sensitive personal information.

## Deployment Checklist

- Run `npm run build` in both `frontend` and `backend`.
- Keep `.env` and `.env.local` files out of Git.
- Configure `INTERNAL_API_URL`, `FRONTEND_URL`, and `NEXT_PUBLIC_BUG_REPORT_EMAIL` in the hosting provider.
- Confirm `/api/health` reports the backend as online after deployment.
- Test one low-risk message, one suspicious message, and one critical phishing sample.

## Roadmap

- Add optional PDF export for clean reports.
- Expand trusted-domain and brand coverage with additional tests.
- Explore email header analysis for more advanced sender verification.
- Add optional URL reputation lookups while keeping the rule-based model understandable.
