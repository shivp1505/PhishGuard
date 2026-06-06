"use client";

import { AlertTriangle, Check, Copy, FileText, Loader2, ScanLine, ShieldCheck, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { analyzeMessage } from "@/lib/api";
import { scannerSamplePool } from "@/lib/sampleMessages";
import { saveScanHistory } from "@/lib/scanHistory";
import { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";
import { CommandButton } from "./dashboard/CommandButton";
import { DashboardPanel } from "./dashboard/DashboardPanel";

const emptyForm: AnalyzeRequest = {
  sender: "",
  subject: "",
  message: "",
  url: ""
};
const privacyAckKey = "phishguard:privacyAcknowledged";

export function ScannerForm({
  onResult,
  loadedSample,
  onSampleConsumed,
  onLoadingChange
}: {
  onResult: (result: AnalyzeResponse | null) => void;
  loadedSample: AnalyzeRequest | null;
  onSampleConsumed: () => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const [form, setForm] = useState<AnalyzeRequest>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyError, setCopyError] = useState("");
  const [lastReport, setLastReport] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastSampleIndex, setLastSampleIndex] = useState<number | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  const [privacyFading, setPrivacyFading] = useState(false);

  useEffect(() => {
    function refreshPrivacyAcknowledgement() {
      const accepted = window.localStorage.getItem(privacyAckKey) === "true";
      setPrivacyAccepted(accepted);
      setShowPrivacyNotice(!accepted);
      setPrivacyFading(false);
    }

    refreshPrivacyAcknowledgement();
    window.addEventListener("phishguard:privacy-updated", refreshPrivacyAcknowledgement);

    return () => window.removeEventListener("phishguard:privacy-updated", refreshPrivacyAcknowledgement);
  }, []);

  useEffect(() => {
    if (loadedSample) {
      setForm({ ...emptyForm, ...loadedSample });
      setError("");
      setCopyError("");
      setCopied(false);
      setLastReport("");
      onResult(null);
      onSampleConsumed();
      document.getElementById("scanner")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loadedSample, onResult, onSampleConsumed]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!privacyAccepted) {
      setError("Please review and accept the privacy note before using the scanner.");
      return;
    }

    setError("");
    setCopyError("");
    setLastReport("");
    setCopied(false);
    onResult(null);
    setLoading(true);
    onLoadingChange(true);

    try {
      const result = await analyzeMessage(form);
      onResult(result);
      saveScanHistory({ ...form }, result);
      setCopied(false);
      const report = [
        `PhishGuard Report`,
        `Verdict: ${result.verdict}`,
        `Risk Score: ${result.riskScore}/100`,
        `Risk Level: ${result.riskLevel}`,
        `Confidence: ${result.confidence}`,
        `Evidence Strength: ${result.evidenceStrength}`,
        `Summary: ${result.summary}`,
        "",
        "Indicators:",
        ...result.indicators.map((indicator) => `- ${indicator.type} (+${indicator.score}): ${indicator.description}`),
        "",
        "Not Found:",
        ...(result.notFound.length ? result.notFound.map((item) => `- ${item}`) : ["- No missing-evidence notes"]),
        "",
        "Recommendations:",
        ...result.recommendations.map((recommendation) => `- ${recommendation}`)
      ].join("\n");
      setLastReport(report);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to analyze the message.";
      setError(message);
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }

  function updateField(field: keyof AnalyzeRequest, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearForm() {
    if (loading) return;
    setForm(emptyForm);
    setError("");
    setCopyError("");
    setLastReport("");
    setCopied(false);
    onResult(null);
  }

  async function copyReport() {
    if (!lastReport) return;
    setCopyError("");

    try {
      await navigator.clipboard.writeText(lastReport);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("Copy failed. Your browser may be blocking clipboard access.");
    }
  }

  function loadSample() {
    if (loading) return;
    if (!privacyAccepted) {
      setError("Please review and accept the privacy note before loading a sample.");
      return;
    }

    const nextIndex =
      scannerSamplePool.length <= 1
        ? 0
        : (() => {
            let index = Math.floor(Math.random() * scannerSamplePool.length);
            if (index === lastSampleIndex) {
              index = (index + 1) % scannerSamplePool.length;
            }
            return index;
          })();
    const sample = scannerSamplePool[nextIndex];
    setForm({ ...emptyForm, ...sample.payload });
    setLastSampleIndex(nextIndex);
    onResult(null);
    setError("");
    setCopyError("");
    setLastReport("");
    setCopied(false);
  }

  function acceptPrivacyNote() {
    window.localStorage.setItem(privacyAckKey, "true");
    setPrivacyAccepted(true);
    setShowPrivacyNotice(true);
    setPrivacyFading(true);
    window.setTimeout(() => {
      setShowPrivacyNotice(false);
      window.dispatchEvent(new Event("phishguard:privacy-updated"));
    }, 650);
    setError("");
  }

  return (
    <DashboardPanel title="Message Intake">
      {showPrivacyNotice && (
        <div
          className={`mb-5 rounded-md border p-4 text-sm leading-6 transition-all duration-700 ${
            privacyFading
              ? "-translate-y-2 border-transparent opacity-0"
              : "translate-y-0 border-[#8d84e8]/30 bg-[#8d84e8]/10 text-neutral-200 opacity-100"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-[#8d84e8]" size={18} />
              <div>
                <p className="font-semibold uppercase tracking-wide text-white">Privacy acknowledgement</p>
                <p className="mt-1 text-neutral-300">
                  Do not enter real passwords, Social Security numbers, banking details, or sensitive personal information.
                  Messages are sent to the backend only for analysis and are not stored there. Recent scans are saved in this browser only when local history is enabled.
                </p>
              </div>
            </div>
            <CommandButton type="button" variant="secondary" onClick={acceptPrivacyNote} className="shrink-0">
              <Check size={16} />
              I understand
            </CommandButton>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid gap-4">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[#F4F7F5]">
            Sender
            <input
              disabled={!privacyAccepted}
              value={form.sender ?? ""}
              onChange={(event) => updateField("sender", event.target.value)}
              placeholder="security@example.com"
              className="focus-ring w-full rounded-md border border-white/15 bg-[#0A0F12] px-4 py-2.5 text-[#F4F7F5] placeholder:text-[#6F7A75] disabled:cursor-not-allowed disabled:opacity-55"
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[#F4F7F5]">
            Subject
            <input
              disabled={!privacyAccepted}
              value={form.subject ?? ""}
              onChange={(event) => updateField("subject", event.target.value)}
              placeholder="Final warning: verify your account"
              className="focus-ring w-full rounded-md border border-white/15 bg-[#0A0F12] px-4 py-2.5 text-[#F4F7F5] placeholder:text-[#6F7A75] disabled:cursor-not-allowed disabled:opacity-55"
            />
          </label>
        </div>

        <label className="grid min-w-0 gap-2 text-sm font-medium text-[#F4F7F5]">
          URL
          <input
            disabled={!privacyAccepted}
            value={form.url ?? ""}
            onChange={(event) => updateField("url", event.target.value)}
            placeholder="https://example.com/login"
            className="focus-ring w-full rounded-md border border-white/15 bg-[#0A0F12] px-4 py-2.5 text-[#F4F7F5] placeholder:text-[#6F7A75] disabled:cursor-not-allowed disabled:opacity-55"
          />
        </label>

        <label className="grid min-w-0 gap-2 text-sm font-medium text-[#F4F7F5]">
          Message Body
          <textarea
            required
            disabled={!privacyAccepted}
            value={form.message ?? ""}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Paste the suspicious email, SMS, or direct message here..."
            rows={8}
            className="focus-ring min-h-[240px] resize-y rounded-md border border-white/15 bg-[#0A0F12] px-4 py-3 font-mono text-sm leading-6 text-[#F4F7F5] placeholder:text-[#6F7A75] disabled:cursor-not-allowed disabled:opacity-55 lg:min-h-[260px]"
          />
        </label>

        <div className="flex gap-3 rounded-md border border-[#F59E0B]/25 bg-[#F59E0B]/10 p-3 text-xs leading-5 text-yellow-100 sm:text-sm">
          <AlertTriangle className="mt-0.5 shrink-0 text-[#F59E0B]" size={18} />
          <p>Do not paste real passwords or sensitive information. This tool is for security analysis only.</p>
        </div>

        <div className="sticky bottom-3 z-20 -mx-1 flex flex-col gap-3 rounded-md border border-white/10 bg-[#0D1114]/95 p-3 shadow-[0_-12px_30px_rgba(0,0,0,0.35)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-neutral-500">{(form.message ?? "").length} / 10000 characters</p>
          <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <CommandButton type="submit" disabled={loading || !privacyAccepted} className="w-full px-4 sm:w-auto">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
              Analyze Message
            </CommandButton>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              <CommandButton type="button" variant="secondary" onClick={clearForm} disabled={loading} className="px-3" aria-label="Clear scanner form">
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear</span>
              </CommandButton>
              <CommandButton type="button" variant="secondary" onClick={loadSample} disabled={!privacyAccepted || loading} className="px-3" aria-label="Load sample message">
                <FileText size={16} />
                <span className="hidden sm:inline">Sample</span>
              </CommandButton>
              <CommandButton type="button" variant="secondary" onClick={copyReport} disabled={!lastReport || !privacyAccepted || loading} className="px-3" aria-label="Copy report">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </CommandButton>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        )}

        {copyError && (
          <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {copyError}
          </p>
        )}
      </form>
    </DashboardPanel>
  );
}
