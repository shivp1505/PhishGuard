import { Upload } from "lucide-react";
import { SampleMessage } from "@/lib/sampleMessages";
import { AnalyzeRequest } from "@/lib/types";
import { Badge } from "./Badge";
import { CommandButton } from "./dashboard/CommandButton";

export function ExampleCard({
  sample,
  onLoad
}: {
  sample: SampleMessage;
  onLoad: (payload: AnalyzeRequest) => void;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-[#11171B] p-5 transition-colors duration-200 hover:bg-[#131B20]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{sample.title}</h3>
        <Badge label={sample.risk} />
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-mist">{sample.scenario}</p>
      <p className="mt-3 min-h-16 text-sm leading-6 text-neutral-400">{sample.description}</p>
      <p className="mt-3 rounded-md border border-white/10 bg-[#0A0F12] p-3 text-xs leading-5 text-[#A8B3AD]">
        Expected: {sample.expectedOutcome}
      </p>
      <CommandButton className="mt-5 w-full" variant="secondary" onClick={() => onLoad(sample.payload)}>
        <Upload size={16} />
        Load Example
      </CommandButton>
    </article>
  );
}
