# PhishGuard Backend

Express TypeScript API for rule-based phishing analysis.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

## Endpoints

- `GET /health`
- `POST /api/analyze`

## Notes

Messages are analyzed in memory and are not stored. Version 1 does not use a database or AI service.
