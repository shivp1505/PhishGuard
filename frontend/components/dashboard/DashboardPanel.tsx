import { ComponentPropsWithoutRef, ReactNode } from "react";

type DashboardPanelProps = ComponentPropsWithoutRef<"section"> & {
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function DashboardPanel({ title, eyebrow, actions, className = "", children, ...props }: DashboardPanelProps) {
  return (
    <section
      className={`rounded-md border border-white/10 bg-[#0D1114] shadow-[0_0_24px_rgba(0,0,0,0.35)] ${className}`}
      {...props}
    >
      {(title || eyebrow || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F7A75]">{eyebrow}</p>}
            {title && <h2 className="text-lg font-semibold uppercase tracking-wide text-[#F4F7F5]">{title}</h2>}
          </div>
          {actions}
        </div>
      )}
      <div className={title || eyebrow || actions ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatusDot({ tone = "green" }: { tone?: "green" | "amber" | "red" | "muted" }) {
  const tones = {
    green: "bg-[#7CFF62] shadow-[0_0_10px_rgba(124,255,98,0.45)]",
    amber: "bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.35)]",
    red: "bg-[#FF4D4D] shadow-[0_0_10px_rgba(255,77,77,0.35)]",
    muted: "bg-[#6F7A75]"
  };

  return <span className={`inline-block size-2 rounded-full ${tones[tone]}`} />;
}

