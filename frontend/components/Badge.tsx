import { RiskLevel, Severity } from "@/lib/types";

const riskStyles: Record<RiskLevel | Severity, string> = {
  Low: "border-sage/30 bg-sage/10 text-sage",
  Medium: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
  High: "border-red-400/30 bg-red-400/10 text-red-300",
  Critical: "border-red-600/40 bg-red-600/15 text-red-200"
};

export function Badge({ label }: { label: RiskLevel | Severity | string }) {
  const style = label in riskStyles ? riskStyles[label as RiskLevel | Severity] : "border-white/10 bg-white/[0.07] text-neutral-200";

  return (
    <span className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}>
      {label}
    </span>
  );
}
