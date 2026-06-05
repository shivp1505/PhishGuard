import { AnalyzeResponse } from "@/lib/types";

export function ScoreBreakdown({ result }: { result: AnalyzeResponse }) {
  const scoringIndicators = result.indicators.filter((indicator) => indicator.score > 0);
  const contextIndicators = result.indicators.filter((indicator) => indicator.score === 0);

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Why this score?</p>
          <h3 className="mt-1 text-base font-semibold">Score breakdown</h3>
        </div>
        <p className="font-mono text-xs text-neutral-500">{result.riskScore} / 100 total</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
        {scoringIndicators.length > 0 ? (
          scoringIndicators.map((indicator) => (
            <div key={indicator.type} className="grid gap-2 border-b border-white/10 bg-white/[0.025] p-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{indicator.type}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-400">{indicator.description}</p>
              </div>
              <span className="w-fit shrink-0 rounded-md bg-white/[0.08] px-2.5 py-1 font-mono text-xs text-neutral-200">
                  +{indicator.score}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-white/[0.025] p-4 text-sm text-neutral-300">
            No scoring indicators were found. Any shown signals are context notes only.
          </div>
        )}
      </div>

      {contextIndicators.length > 0 && (
        <div className="mt-4 rounded-lg border border-mist/20 bg-mist/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-mist">Context signals</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {contextIndicators.map((indicator) => (
              <span key={indicator.type} className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-neutral-200">
                {indicator.type} +0
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
