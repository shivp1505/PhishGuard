import { RiskLevel } from "@/lib/types";

const riskColors: Record<RiskLevel, string> = {
  Low: "#22C55E",
  Medium: "#F59E0B",
  High: "#FF4D4D",
  Critical: "#DC2626"
};

export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = riskColors[level];

  return (
    <div className="mx-auto grid min-h-[190px] w-full max-w-[300px] place-items-center rounded-md border border-white/10 bg-[#0A0F12]/80 px-6 py-8 text-center">
      <div>
        <p className="font-mono text-[5rem] font-bold leading-none tracking-normal" style={{ color }}>
          {score}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 font-mono text-sm text-[#A8B3AD]">
          <span>/100</span>
          <span className="h-1 w-1 rounded-full bg-[#6F7A75]" />
          <span>{clamped}%</span>
        </div>
      </div>
    </div>
  );
}
