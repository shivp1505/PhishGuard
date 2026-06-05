import { AlertTriangle, Link2, LockKeyhole, MailWarning, Paperclip, WalletCards } from "lucide-react";
import { Indicator } from "@/lib/types";
import { Badge } from "./Badge";

function getIcon(type: string) {
  if (type.includes("Link")) return Link2;
  if (type.includes("Credential")) return LockKeyhole;
  if (type.includes("Financial")) return WalletCards;
  if (type.includes("Attachment")) return Paperclip;
  if (type.includes("Sender")) return MailWarning;
  return AlertTriangle;
}

export function formatDomainVerdict(value: unknown) {
  if (value === "known-service-with-risk-context") {
    return "Known service link, suspicious surrounding context";
  }
  if (value === "known-service") {
    return "Known service link";
  }
  if (value === "shared-content") {
    return "Shared-content platform";
  }
  if (value === "shared-content-with-risk-context") {
    return "Shared-content platform, suspicious surrounding context";
  }
  return String(value);
}

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const Icon = getIcon(indicator.type);

  return (
    <article className="rounded-lg bg-white/[0.035] p-4 transition-colors duration-200 hover:bg-white/[0.06]">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-mist">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{indicator.type}</h3>
            <Badge label={indicator.severity} />
            <span className="rounded-md bg-white/[0.07] px-2.5 py-1 text-xs text-neutral-300">
              +{indicator.score}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-400">{indicator.description}</p>
          {indicator.metadata?.domainVerdict && (
            <p className="mt-3 rounded-lg bg-mist/10 px-3 py-2 text-xs font-medium text-mist">
              Domain verdict: {formatDomainVerdict(indicator.metadata.domainVerdict)}
            </p>
          )}
          {indicator.matches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {indicator.matches.slice(0, 5).map((match) => (
                <span
                  key={match}
                  className="max-w-full truncate rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-neutral-300"
                  title={match}
                >
                  {match}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
