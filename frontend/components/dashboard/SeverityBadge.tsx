import { RiskLevel, Severity } from "@/lib/types";

const styles: Record<RiskLevel | Severity, string> = {
  Low: "border-[#22C55E]/70 bg-[#22C55E]/10 text-[#22C55E]",
  Medium: "border-[#F59E0B]/70 bg-[#F59E0B]/10 text-[#F59E0B]",
  High: "border-[#FF4D4D]/70 bg-[#FF4D4D]/10 text-[#FF4D4D]",
  Critical: "border-[#DC2626]/80 bg-[#DC2626]/15 text-red-200"
};

export function SeverityBadge({ label }: { label: RiskLevel | Severity | string }) {
  const style = label in styles ? styles[label as RiskLevel | Severity] : "border-white/15 bg-white/[0.04] text-[#A8B3AD]";

  return (
    <span className={`inline-flex rounded-md border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide ${style}`}>
      {label}
    </span>
  );
}
