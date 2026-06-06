"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bug, Check, Clipboard, FileText, Link2, Mail, ShieldCheck, X } from "lucide-react";

const bugReportEmail = process.env.NEXT_PUBLIC_BUG_REPORT_EMAIL ?? "bugs@shivpatel.net";

const helpItems = [
  {
    icon: Mail,
    title: "Sender",
    text: "Paste the visible sender address or display name. PhishGuard checks for brand and domain mismatch signals."
  },
  {
    icon: FileText,
    title: "Subject",
    text: "Use the exact subject line. Security wording in the subject is treated as a weak signal unless the body supports it."
  },
  {
    icon: Link2,
    title: "URL",
    text: "Add a suspicious link if it is separate from the message body. Links inside the body are scanned too."
  },
  {
    icon: ShieldCheck,
    title: "Message Body",
    text: "Paste the suspicious email, SMS, or direct message. The analyzer looks for urgency, credentials, social engineering, links, attachments, and writing quality."
  }
];

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [bugReportOpen, setBugReportOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 0);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setBugReportOpen(false);
    }
  }, [open]);

  if (!open) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      if (bugReportOpen) {
        setBugReportOpen(false);
        return;
      }
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        <div ref={modalRef} className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-white/10 bg-[#0D1114] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F7A75]">Field Guide</p>
              <h2 className="text-lg font-semibold uppercase tracking-wide">How PhishGuard Works</h2>
            </div>
            <button data-autofocus className="grid size-9 place-items-center rounded-md text-[#A8B3AD] hover:bg-white/[0.06] hover:text-white" onClick={onClose} aria-label="Close help">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-5 overflow-y-auto p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {helpItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-md border border-white/10 bg-[#0A0F12] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-md border border-[#8d84e8]/30 bg-[#8d84e8]/10 text-[#8d84e8]">
                        <Icon size={18} />
                      </span>
                      <h3 className="text-sm font-semibold uppercase tracking-wide">{item.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#A8B3AD]">{item.text}</p>
                  </article>
                );
              })}
            </div>

            <div className="rounded-md border border-[#F59E0B]/25 bg-[#F59E0B]/10 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-[#F59E0B]" size={18} />
                <p className="text-sm leading-6 text-yellow-100">
                  PhishGuard is an educational rule-based scanner. Do not paste real passwords, verification codes, banking details, Social Security numbers, or sensitive personal information.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-[#0A0F12] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide">Reading the Results</h3>
              <p className="mt-2 text-sm leading-6 text-[#A8B3AD]">
                The risk score combines detected indicators. Low scores are not proof that a message is safe, and high scores should be verified through official channels before clicking links, opening files, or sharing information.
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-[#0A0F12] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                    <Bug size={16} />
                    Report Bugs
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#A8B3AD]">
                    Open a focused bug report form without including sensitive message content.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBugReportOpen(true)}
                  className="min-h-10 rounded-md border border-[#8d84e8]/50 bg-[#8d84e8]/10 px-3 text-xs font-semibold uppercase tracking-wide text-[#DCD8FF] hover:bg-[#8d84e8]/15"
                >
                  Report bug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BugReportModal open={bugReportOpen} onClose={() => setBugReportOpen(false)} />
    </>
  );
}

function BugReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [bugSummary, setBugSummary] = useState("");
  const [bugDetails, setBugDetails] = useState("");
  const [bugContact, setBugContact] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [sendError, setSendError] = useState("");

  const bugReportBody = useMemo(
    () =>
      [
        "PhishGuard Bug Report",
        "",
        `Summary: ${bugSummary || "Not provided"}`,
        "",
        "Details:",
        bugDetails || "Not provided",
        "",
        `Contact: ${bugContact || "Not provided"}`,
        `Page: ${typeof window !== "undefined" ? window.location.href : "Unknown"}`,
        `User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"}`,
        "",
        "Please do not include passwords, verification codes, banking details, or sensitive personal data."
      ].join("\n"),
    [bugContact, bugDetails, bugSummary]
  );

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 0);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setSendStatus("");
      setSendError("");
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function submitBugReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setSendStatus("");
    setSendError("");

    try {
      const response = await fetch("/api/bug-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: bugSummary,
          details: bugDetails,
          contact: bugContact,
          page: window.location.href,
          userAgent: navigator.userAgent
        })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Bug report could not be sent.");
      }

      setSendStatus(data.message ?? "Bug report sent. Thank you for helping improve PhishGuard.");
      setBugSummary("");
      setBugDetails("");
      setBugContact("");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Bug report could not be sent.";
      setSendError(message);
    } finally {
      setSending(false);
    }
  }

  async function copyBugReport() {
    try {
      await navigator.clipboard.writeText(bugReportBody);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bug-report-title" onKeyDown={handleKeyDown}>
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close bug report" />
      <div ref={modalRef} className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-white/10 bg-[#0D1114] shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F7A75]">Website Feedback</p>
            <h2 id="bug-report-title" className="text-lg font-semibold uppercase tracking-wide">Report a Bug</h2>
          </div>
          <button data-autofocus className="grid size-9 place-items-center rounded-md text-[#A8B3AD] hover:bg-white/[0.06] hover:text-white" onClick={onClose} aria-label="Close bug report">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="mb-4 rounded-md border border-[#F59E0B]/25 bg-[#F59E0B]/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-[#F59E0B]" size={18} />
              <p className="text-sm leading-6 text-yellow-100">
                Please describe website issues only. Do not include passwords, verification codes, banking details, or sensitive message content.
              </p>
            </div>
          </div>

          <form onSubmit={submitBugReport} className="grid gap-3">
                <label className="grid gap-2 text-sm font-medium text-[#F4F7F5]">
                  Summary
                  <input
                    value={bugSummary}
                    onChange={(event) => setBugSummary(event.target.value)}
                    placeholder="Ranking popup does not close on mobile"
                    className="focus-ring w-full rounded-md border border-white/15 bg-[#050708] px-3 py-2 text-sm text-[#F4F7F5] placeholder:text-[#6F7A75]"
                    maxLength={120}
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#F4F7F5]">
                  Details
                  <textarea
                    value={bugDetails}
                    onChange={(event) => setBugDetails(event.target.value)}
                    placeholder="What happened, what you expected, and how to reproduce it."
                    className="focus-ring min-h-28 w-full resize-y rounded-md border border-white/15 bg-[#050708] px-3 py-2 text-sm leading-6 text-[#F4F7F5] placeholder:text-[#6F7A75]"
                    maxLength={1200}
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#F4F7F5]">
                  Contact email optional
                  <input
                    value={bugContact}
                    onChange={(event) => setBugContact(event.target.value)}
                    placeholder="you@example.com"
                    className="focus-ring w-full rounded-md border border-white/15 bg-[#050708] px-3 py-2 text-sm text-[#F4F7F5] placeholder:text-[#6F7A75]"
                    maxLength={160}
                  />
                </label>
                <p className="text-xs leading-5 text-[#A8B3AD]">
                  Reports are sent to <span className="font-mono text-[#D7DDD9]">{bugReportEmail}</span>. If sending fails, copy the report and email it manually.
                </p>
                {sendStatus && (
                  <p className="rounded-md border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-2 text-sm text-green-100">
                    {sendStatus}
                  </p>
                )}
                {sendError && (
                  <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
                    {sendError}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#8d84e8]/70 bg-[#8d84e8]/15 px-3 text-xs font-semibold uppercase tracking-wide text-[#DCD8FF] hover:bg-[#8d84e8]/20"
                  >
                    <Mail size={15} />
                    {sending ? "Sending..." : "Send report"}
                  </button>
                  <button
                    type="button"
                    onClick={copyBugReport}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.035] px-3 text-xs font-semibold uppercase tracking-wide text-[#F4F7F5] hover:bg-white/[0.06]"
                  >
                    {copied ? <Check size={15} /> : <Clipboard size={15} />}
                    {copied ? "Copied" : "Copy report"}
                  </button>
                </div>
          </form>
        </div>
      </div>
    </div>
  );
}
