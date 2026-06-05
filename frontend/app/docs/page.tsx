import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Github,
  History,
  LockKeyhole,
  Route,
  Server,
  ShieldCheck,
  Terminal,
  TriangleAlert
} from "lucide-react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";

const updateLog = [
  ["June 5, 2026", "Prepared the docs for deployment, tuned the demo library, cleaned up the command center, and refreshed the About section."],
  ["V1 scoring polish", "Added trusted-domain context, sender mismatch checks, link text mismatch checks, writing-quality signals, and low-evidence calibration."],
  ["V1 privacy polish", "Disabled local history by default, removed report contents from URLs, added a clear local data action, and added backend timeout handling."]
];

const quickStart = [
  ["Paste the message", "Add the sender, subject, message body, and any URL that appeared in the email or text."],
  ["Run the scan", "PhishGuard checks the content against a local rule-based scoring model."],
  ["Read the evidence", "The result shows the score, matched indicators, confidence, and recommended next steps."],
  ["Export if useful", "The report view can copy or export a clean summary for notes, classwork, or reporting."]
];

const scoreRanges = [
  ["Low", "0-24", "Few or no warning signs. Still verify unexpected requests before acting."],
  ["Medium", "25-49", "Some suspicious context exists. Slow down and verify through an official channel."],
  ["High", "50-74", "Multiple warning signs are present. Avoid links and attachments until verified."],
  ["Critical", "75-100", "Strong phishing indicators. Do not interact and report the message if it came through school or work."]
];

const scoringSignals = [
  ["Urgency", "Pressure words, deadlines, account locks, and immediate action language."],
  ["Credentials", "Requests for passwords, logins, verification codes, or identity confirmation."],
  ["Links", "Shorteners, IP addresses, HTTP links, lookalike domains, and mixed destination domains."],
  ["Mismatch", "Sender names or visible link text that do not match the real destination."],
  ["Money", "Billing, invoice, refund, transaction, or payment pressure."],
  ["Writing quality", "Misspellings, odd spacing, all-caps pressure, and repeated punctuation as supporting evidence."]
];

const privacyNotes = [
  "Messages are sent to the backend for analysis, but the backend does not store submissions.",
  "The report page uses browser session storage so a result can be viewed without placing message content in the URL.",
  "Optional scan history is off by default and stays in the user's browser when enabled.",
  "Users should not paste passwords, verification codes, Social Security numbers, financial details, or private personal data."
];

const limitations = [
  "Rule-based detection can miss new attacks, image-only phishing, and highly targeted impersonation.",
  "A trusted domain is not automatically safe; real services can be abused in phishing messages.",
  "PhishGuard is built for awareness and learning, not as a replacement for enterprise email security tools.",
  "The trusted-domain and brand lists should be expanded carefully so the model does not become too permissive."
];

const developerNotes = [
  ["Frontend", "Next.js app with same-origin routes for scanner and health checks."],
  ["Backend", "Express TypeScript service that runs the scoring engine and exposes GET /health."],
  ["Analyze route", "POST /api/analyze proxies to the backend through INTERNAL_API_URL."],
  ["Rate limiting", "Backend limits can be tuned with RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS, and TRUST_PROXY_HOPS."],
  ["Deployment path", "Recommended public URL: phishguard.shivpatel.net with frontend and backend hosted separately."]
];

export default function DocsPage() {
  return (
    <>
      <AnimatedBackground />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-300 transition hover:text-white">
          <ArrowLeft size={16} />
          Back to scanner
        </Link>

        <section className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-md border border-[#8d84e8]/25 bg-[#8d84e8]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#8d84e8]">
            <Terminal size={14} />
            Public Docs
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">PhishGuard Docs</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-300">
            A clear guide to what PhishGuard checks, how the score is calculated, what data is handled, and what the current Version 1 build can and cannot do.
          </p>
        </section>

        <DashboardPanel className="mt-8 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <History className="text-mist" size={20} />
            <h2 className="text-2xl font-semibold">Update Log</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {updateLog.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/[0.045] p-4">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-sm leading-6 text-neutral-400">{value}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <DashboardPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-mist" size={20} />
              <h2 className="text-2xl font-semibold">What PhishGuard Does</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              PhishGuard scans suspicious emails, texts, and links for common phishing indicators. It is meant to help someone slow down, see the evidence, and decide what to do next.
            </p>
            <div className="mt-5 grid gap-3">
              {quickStart.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/[0.045] p-4">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">{value}</p>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-mist" size={20} />
              <h2 className="text-2xl font-semibold">Score Ranking</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {scoreRanges.map(([label, range, value]) => (
                <div key={label} className="rounded-lg bg-white/[0.045] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="font-mono text-xs text-[#8d84e8]">{range}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">{value}</p>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <DashboardPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-mist" size={20} />
              <h2 className="text-2xl font-semibold">Scoring Signals</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              The score comes from matched rules. Strong indicators add more points, while weak context signals are kept lower so normal messages do not become scary by accident.
            </p>
            <div className="mt-5 grid gap-3">
              {scoringSignals.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/[0.045] p-4">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">{value}</p>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <LockKeyhole className="text-mist" size={20} />
              <h2 className="text-2xl font-semibold">Privacy</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {privacyNotes.map((item) => (
                <p key={item} className="rounded-lg bg-white/[0.045] p-4 text-sm leading-6 text-neutral-300">
                  {item}
                </p>
              ))}
            </div>
          </DashboardPanel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <DashboardPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <TriangleAlert className="text-mist" size={20} />
              <h2 className="text-2xl font-semibold">Limitations</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {limitations.map((item) => (
                <p key={item} className="rounded-lg bg-white/[0.045] p-4 text-sm leading-6 text-neutral-300">
                  {item}
                </p>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Server className="text-mist" size={20} />
              <h2 className="text-2xl font-semibold">Developer Notes</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {developerNotes.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/[0.045] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-300">{value}</p>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </section>

        <DashboardPanel className="mt-5 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Route className="text-mist" size={20} />
                <h2 className="text-2xl font-semibold">Repository</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-neutral-400">
                The GitHub link will be added after the project repository is published. Until then, this section avoids sending users to an empty repo page.
              </p>
            </div>
            <div className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-neutral-500">
              <Github size={16} />
              Repository link pending
            </div>
          </div>
        </DashboardPanel>
      </main>
    </>
  );
}
