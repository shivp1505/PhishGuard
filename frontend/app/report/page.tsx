"use client";

import { ArrowLeft, Copy, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Badge } from "@/components/Badge";
import { CommandButton } from "@/components/dashboard/CommandButton";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { formatDomainVerdict } from "@/components/IndicatorCard";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { loadReportById, loadSavedReport, saveReport } from "@/lib/reportStorage";
import { AnalyzeResponse } from "@/lib/types";

function formatReport(result: AnalyzeResponse) {
  return [
    "PhishGuard Report",
    `Verdict: ${result.verdict}`,
    `Score: ${result.riskScore}/100`,
    `Risk Level: ${result.riskLevel}`,
    `Confidence: ${result.confidence}`,
    `Evidence Strength: ${result.evidenceStrength}`,
    "",
    `Interpretation: ${result.summary}`,
    "",
    "Score Breakdown:",
    ...(result.indicators.some((indicator) => indicator.score > 0)
      ? result.indicators
          .filter((indicator) => indicator.score > 0)
          .map((indicator) => `- ${indicator.type}: +${indicator.score}`)
      : ["- No scoring indicators found"]),
    "",
    "Context Signals:",
    ...(result.indicators.some((indicator) => indicator.score === 0)
      ? result.indicators
          .filter((indicator) => indicator.score === 0)
          .map((indicator) => `- ${indicator.type}: +0`)
      : ["- No context-only signals found"]),
    "",
    "Evidence:",
    ...(result.indicators.length
      ? result.indicators.map((indicator) => `- ${indicator.type} (+${indicator.score}): ${indicator.description}`)
      : ["- No clear phishing indicators detected"]),
    "",
    "Not Found:",
    ...(result.notFound.length ? result.notFound.map((item) => `- ${item}`) : ["- No missing-evidence notes"]),
    "",
    "Recommendations:",
    ...result.recommendations.map((item) => `- ${item}`)
  ].join("\n");
}

export default function ReportPage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const reportText = useMemo(() => (result ? formatReport(result) : ""), [result]);
  const scoringIndicatorCount = result?.indicators.filter((indicator) => indicator.score > 0).length ?? 0;
  const contextSignalCount = result?.indicators.filter((indicator) => indicator.score === 0).length ?? 0;

  useEffect(() => {
    const reportId = new URLSearchParams(window.location.search).get("id");
    const reportFromId = reportId ? loadReportById(reportId) : null;

    if (reportFromId) {
      saveReport(reportFromId);
      setResult(reportFromId);
      return;
    }

    setResult(loadSavedReport());
  }, []);

  async function copyReport() {
    if (!reportText) return;
    setCopyError("");

    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("Copy failed. Your browser may be blocking clipboard access.");
    }
  }

  function exportReport() {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "phishguard-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <AnimatedBackground />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-300 transition hover:text-white">
          <ArrowLeft size={16} />
          Back to scanner
        </Link>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#8d84e8]/25 bg-[#8d84e8]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#8d84e8]">
              <FileText size={14} />
              Clean report view
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">PhishGuard Report</h1>
            <p className="mt-3 max-w-2xl text-neutral-300">A private browser-based summary of the latest scan result.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CommandButton variant="secondary" onClick={copyReport} disabled={!result}>
              <Copy size={16} />
              {copied ? "Copied" : "Copy"}
            </CommandButton>
            <CommandButton onClick={exportReport} disabled={!result}>
              <Download size={16} />
              Export
            </CommandButton>
          </div>
        </div>

        {copyError && (
          <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {copyError}
          </p>
        )}

        {!result ? (
          <DashboardPanel className="mt-8 p-8 text-center">
            <h2 className="text-2xl font-semibold">No report found</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-400">
              Run a scan first, then open the report view from the results panel.
            </p>
          </DashboardPanel>
        ) : (
          <div className="mt-8 grid gap-5">
            <DashboardPanel className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Verdict</p>
                  <h2 className="mt-2 text-3xl font-semibold">{result.verdict}</h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-300">{result.summary}</p>
                </div>
                <div className="rounded-xl bg-white/[0.055] p-5 text-center">
                  <p className="text-5xl font-semibold">{result.riskScore}</p>
                  <p className="mt-1 text-xs text-neutral-500">/ 100</p>
                  <div className="mt-3"><Badge label={result.riskLevel} /></div>
                </div>
              </div>
            </DashboardPanel>

            <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <DashboardPanel className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Assessment snapshot</p>
                <div className="mt-4 grid gap-3">
                  {[
                    ["Confidence", result.confidence],
                    ["Evidence strength", result.evidenceStrength],
                    ["Scoring indicators", String(scoringIndicatorCount)],
                    ["Context signals", String(contextSignalCount)]
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.045] p-3 text-sm">
                      <span className="text-neutral-400">{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </DashboardPanel>

              <DashboardPanel className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Score details</p>
                <div className="mt-4">
                  <ScoreBreakdown result={result} />
                </div>
              </DashboardPanel>
            </section>

            <DashboardPanel className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Evidence</p>
              <div className="mt-4 grid gap-3">
                {result.indicators.length > 0 ? (
                  result.indicators.map((indicator) => (
                    <div key={indicator.type} className="rounded-lg bg-white/[0.045] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{indicator.type}</h3>
                        <Badge label={indicator.severity} />
                        <span className="rounded-md bg-white/[0.07] px-2.5 py-1 text-xs text-neutral-300">+{indicator.score}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-neutral-300">{indicator.description}</p>
                      {indicator.metadata?.domainVerdict && (
                        <p className="mt-3 rounded-lg bg-mist/10 px-3 py-2 text-xs font-medium text-mist">
                          Domain verdict: {formatDomainVerdict(indicator.metadata.domainVerdict)}
                        </p>
                      )}
                      {indicator.matches.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {indicator.matches.map((match) => (
                            <span key={match} className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-neutral-300">
                              {match}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg bg-white/[0.045] p-4 text-sm text-neutral-300">No clear phishing indicators detected.</p>
                )}
              </div>
            </DashboardPanel>

            {result.notFound.length > 0 && (
              <DashboardPanel className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">What was not found</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {result.notFound.map((item) => (
                    <p key={item} className="rounded-lg bg-white/[0.045] p-4 text-sm text-neutral-300">
                      {item}
                    </p>
                  ))}
                </div>
              </DashboardPanel>
            )}

            <DashboardPanel className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recommendations</p>
              <div className="mt-4 grid gap-2">
                {result.recommendations.map((item) => (
                  <p key={item} className="rounded-lg bg-white/[0.045] p-4 text-sm text-neutral-300">{item}</p>
                ))}
              </div>
            </DashboardPanel>
          </div>
        )}
      </main>
    </>
  );
}
