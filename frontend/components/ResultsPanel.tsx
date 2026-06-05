"use client";

import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Crosshair,
  ExternalLink,
  FileText,
  Flag,
  Hand,
  Link2,
  LockKeyhole,
  MailWarning,
  Search,
  ShieldAlert,
  WalletCards,
  X
} from "lucide-react";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnalyzeResponse, Indicator, Severity } from "@/lib/types";
import { commandButtonClassName } from "./dashboard/CommandButton";
import { DashboardPanel } from "./dashboard/DashboardPanel";
import { RiskGauge } from "./dashboard/RiskGauge";
import { SeverityBadge } from "./dashboard/SeverityBadge";
import { ReportLink } from "./ReportLink";
import { ScoreBreakdown } from "./ScoreBreakdown";

const riskTextColor = {
  Low: "text-[#22C55E]",
  Medium: "text-[#F59E0B]",
  High: "text-[#FF4D4D]",
  Critical: "text-red-300"
};

const severityIconColor: Record<Severity, string> = {
  Low: "text-[#22C55E]",
  Medium: "text-[#F59E0B]",
  High: "text-[#FF4D4D]"
};

const riskRanges = [
  {
    level: "Low",
    range: "0-24",
    color: "text-[#22C55E]",
    border: "border-[#22C55E]/35",
    background: "bg-[#22C55E]/10",
    meaning: "Few or weak phishing indicators were found. Still verify unexpected messages before sharing sensitive information."
  },
  {
    level: "Medium",
    range: "25-49",
    color: "text-[#F59E0B]",
    border: "border-[#F59E0B]/35",
    background: "bg-[#F59E0B]/10",
    meaning: "The message contains suspicious signals. Review the sender, links, and request before taking action."
  },
  {
    level: "High",
    range: "50-74",
    color: "text-[#FF4D4D]",
    border: "border-[#FF4D4D]/35",
    background: "bg-[#FF4D4D]/10",
    meaning: "Multiple strong warning signs were detected. Avoid links, attachments, and requests until verified."
  },
  {
    level: "Critical",
    range: "75-100",
    color: "text-red-300",
    border: "border-red-500/35",
    background: "bg-red-500/10",
    meaning: "The message has severe phishing characteristics. Do not interact with it and report it if appropriate."
  }
] as const;

function getIcon(type: string) {
  if (type.includes("Link")) return Link2;
  if (type.includes("Credential")) return LockKeyhole;
  if (type.includes("Financial")) return WalletCards;
  if (type.includes("Sender")) return MailWarning;
  if (type.includes("Attachment")) return ShieldAlert;
  return AlertTriangle;
}

function formatAnalysisReport(result: AnalyzeResponse) {
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
    "Indicators:",
    ...(result.indicators.length
      ? result.indicators.map((indicator) => `- ${indicator.type} (${indicator.severity}, +${indicator.score}): ${indicator.description}`)
      : ["- No clear phishing indicators detected"]),
    "",
    "Recommendations:",
    ...result.recommendations.map((recommendation) => `- ${recommendation}`)
  ].join("\n");
}

function RankingButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={commandButtonClassName("secondary", "min-h-9 px-3 text-xs")}>
      <BarChart3 size={15} />
      Ranking
    </button>
  );
}

function LoadingResults({ onOpenRanking }: { onOpenRanking: () => void }) {
  const steps = ["Running detection rules", "Checking urgency language", "Checking links", "Checking credential requests", "Generating risk report"];

  return (
    <DashboardPanel title="Analysis Results" className="min-h-full" actions={<RankingButton onClick={onOpenRanking} />}>
      <div className="grid min-h-[620px] place-items-center">
        <div className="w-full max-w-md">
          <div className="mx-auto grid size-16 animate-pulse place-items-center rounded-md border border-[#8d84e8]/30 bg-[#8d84e8]/10 text-[#8d84e8]">
            <Crosshair size={28} />
          </div>
          <h3 className="mt-5 text-center text-lg font-semibold uppercase tracking-wide">Analyzing...</h3>
          <div className="mt-6 grid gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-xs text-[#A8B3AD]">
                <span className="text-[#8d84e8]">0{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

function EmptyResults({ onOpenRanking }: { onOpenRanking: () => void }) {
  return (
    <DashboardPanel title="Analysis Results" className="min-h-full" actions={<RankingButton onClick={onOpenRanking} />}>
      <div className="grid min-h-[620px] place-items-center text-center">
        <div>
          <div className="mx-auto grid size-16 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-[#A8B3AD]">
            <Crosshair size={30} />
          </div>
          <h3 className="mt-5 text-xl font-semibold uppercase tracking-wide">No analysis yet</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#A8B3AD]">
            Submit a message to generate a phishing risk report with score, indicators, and recommended action.
          </p>
        </div>
      </div>
    </DashboardPanel>
  );
}

function IndicatorRow({ indicator }: { indicator: Indicator }) {
  const Icon = getIcon(indicator.type);

  return (
    <details className="group rounded-md border border-white/10 bg-[#11171B] transition hover:bg-[#131B20]">
      <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 p-4">
        <span className={`grid size-12 place-items-center rounded-full border border-current ${severityIconColor[indicator.severity]}`}>
          <Icon size={23} />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-[#F4F7F5]">{indicator.type}</span>
          <span className="mt-1 line-clamp-2 block text-sm leading-5 text-[#A8B3AD]">{indicator.description}</span>
        </span>
        <SeverityBadge label={indicator.severity} />
        <ChevronDown size={18} className="text-[#A8B3AD] transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-white/10 px-4 pb-4 pt-3">
        <p className="font-mono text-xs uppercase tracking-wide text-[#6F7A75]">Matched evidence</p>
        {indicator.matches.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {indicator.matches.slice(0, 8).map((match) => (
              <span key={match} className="max-w-full truncate rounded-sm border border-white/10 bg-black/25 px-2.5 py-1 font-mono text-xs text-[#A8B3AD]" title={match}>
                {match}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#A8B3AD]">No exact phrase was returned for this signal.</p>
        )}
      </div>
    </details>
  );
}

function RecommendationStrip({ result }: { result: AnalyzeResponse }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const reportText = useMemo(() => formatAnalysisReport(result), [result]);
  const fallback = [
    "Do not click links or provide information.",
    "Verify the sender through an official channel.",
    "Report the message to IT or security."
  ];
  const items = (result.recommendations.length ? result.recommendations : fallback).slice(0, 3);
  const icons = [Hand, Search, Flag];
  const titles = ["Do not click links", "Verify sender", "Report to IT"];

  return (
    <div className="rounded-md border border-white/10 bg-[#0D1114] p-4">
      <h3 className="text-lg font-semibold uppercase tracking-wide">Recommendations</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = icons[index] ?? Flag;
          return (
            <div key={item} className="flex gap-3 border-white/10 lg:border-r lg:pr-4 lg:last:border-r-0">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#8d84e8]/70 text-[#8d84e8]">
                <Icon size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#F4F7F5]">{titles[index] ?? "Recommended action"}</p>
                <p className="mt-1 text-xs leading-5 text-[#A8B3AD]">{item}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={async () => {
            setCopyError("");
            try {
              await navigator.clipboard.writeText(reportText);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            } catch {
              setCopyError("Copy failed. Your browser may be blocking clipboard access.");
            }
          }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8d84e8]/60 bg-[#8d84e8]/10 px-4 text-sm font-semibold uppercase tracking-wide text-[#DCD8FF] transition hover:bg-[#8d84e8]/15"
        >
          <FileText size={16} />
          {copied ? "Report copied" : "Copy report"}
        </button>
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "phishguard-report.txt";
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-[#0A0F12] px-4 text-sm font-semibold uppercase tracking-wide text-[#F4F7F5] transition hover:bg-[#131B20]"
        >
          <FileText size={16} />
          Export report
        </button>
      </div>
      {copyError && <p className="mt-3 text-sm text-red-200">{copyError}</p>}
    </div>
  );
}

function QuietNotFound({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="border-t border-white/10 pt-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6F7A75]">What was not found</p>
      <ul className="mt-3 grid gap-2 text-sm text-[#A8B3AD] sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6F7A75]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankingModal({
  open,
  currentLevel,
  onClose
}: {
  open: boolean;
  currentLevel?: AnalyzeResponse["riskLevel"];
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 0);
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

  return (
    <div className="fixed inset-0 z-[85] grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="ranking-title" onKeyDown={handleKeyDown}>
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close ranking guide" />
      <div ref={modalRef} className="relative w-full max-w-3xl rounded-md border border-white/10 bg-[#0D1114] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F7A75]">Score Guide</p>
            <h2 id="ranking-title" className="text-lg font-semibold uppercase tracking-wide">Risk Ranking</h2>
          </div>
          <button type="button" data-autofocus className="grid size-9 place-items-center rounded-md text-[#A8B3AD] hover:bg-white/[0.06] hover:text-white" onClick={onClose} aria-label="Close ranking guide">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[#A8B3AD]">
              PhishGuard maps the final rule-based score into these ranges. A low score is not a guarantee of safety;
              it only means the submitted text did not contain enough warning signs for a stronger rating.
            </p>
            {currentLevel && (
              <span className="shrink-0 rounded-sm border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-xs text-[#A8B3AD]">
                Current: {currentLevel}
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {riskRanges.map((item) => {
              const active = item.level === currentLevel;
              return (
                <div
                  key={item.level}
                  className={`rounded-md border p-4 ${item.border} ${item.background} ${active ? "ring-1 ring-[#8d84e8]/60" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${item.color}`}>{item.level}</p>
                    <p className="font-mono text-xs text-[#F4F7F5]">{item.range}</p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#D7DDD9]">{item.meaning}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-md border border-white/10 bg-[#0A0F12] p-4 text-sm leading-6 text-[#A8B3AD]">
            The score is educational and rule-based. It should support security awareness, not replace professional email filtering,
            official IT guidance, or careful verification through trusted channels.
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultActions({
  result,
  onOpenRanking
}: {
  result: AnalyzeResponse;
  onOpenRanking: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <RankingButton onClick={onOpenRanking} />
      <ReportLink result={result}>
        <span className={commandButtonClassName("secondary", "min-h-9 px-3 text-xs")}>
          <FileText size={15} />
          Open Report
        </span>
      </ReportLink>
    </div>
  );
}

export function ResultsPanel({
  result,
  loading
}: {
  result: AnalyzeResponse | null;
  loading: boolean;
}) {
  const [rankingOpen, setRankingOpen] = useState(false);

  if (loading) {
    return (
      <>
        <LoadingResults onOpenRanking={() => setRankingOpen(true)} />
        <RankingModal open={rankingOpen} onClose={() => setRankingOpen(false)} />
      </>
    );
  }

  if (!result) {
    return (
      <>
        <EmptyResults onOpenRanking={() => setRankingOpen(true)} />
        <RankingModal open={rankingOpen} onClose={() => setRankingOpen(false)} />
      </>
    );
  }

  return (
    <>
      <DashboardPanel
        title="Analysis Results"
        className="min-h-full"
        actions={<ResultActions result={result} onOpenRanking={() => setRankingOpen(true)} />}
      >
        <div className="grid gap-5">
          <div className="grid gap-5 border-b border-white/10 pb-5 lg:grid-cols-[0.85fr_1fr] lg:items-center">
            <RiskGauge score={result.riskScore} level={result.riskLevel} />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#A8B3AD]">Risk Score</p>
              <h3 className={`mt-2 text-3xl font-semibold ${riskTextColor[result.riskLevel]}`}>{result.riskLevel} Risk</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#D7DDD9]">{result.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <SeverityBadge label={result.verdict} />
                <SeverityBadge label={`Confidence: ${result.confidence}`} />
                <SeverityBadge label={result.evidenceStrength} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold uppercase tracking-wide">Detected Indicators</h3>
            <div className="mt-3 grid gap-2">
              {result.indicators.length > 0 ? (
                result.indicators.map((indicator) => <IndicatorRow key={`${indicator.type}-${indicator.score}`} indicator={indicator} />)
              ) : (
                <div className="rounded-md border border-white/10 bg-[#11171B] p-4 text-sm text-[#A8B3AD]">
                  No major phishing indicators were detected. Keep verifying unexpected or unusual messages.
                </div>
              )}
            </div>
          </div>

          <RecommendationStrip result={result} />

          <details className="group rounded-md border border-white/10 bg-[#0A0F12] p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-wide text-[#A8B3AD] hover:text-white">
              Scoring details
              <ExternalLink size={14} className="ml-2 inline-block" />
            </summary>
            <div className="mt-5 grid gap-5">
              <ScoreBreakdown result={result} />
              <QuietNotFound items={result.notFound} />
            </div>
          </details>
        </div>
      </DashboardPanel>
      <RankingModal open={rankingOpen} currentLevel={result.riskLevel} onClose={() => setRankingOpen(false)} />
    </>
  );
}
