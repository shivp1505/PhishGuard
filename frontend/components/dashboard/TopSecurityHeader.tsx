"use client";

import { Crosshair, ShieldCheck } from "lucide-react";

export function TopSecurityHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <header
      className={`sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/10 bg-[#050708]/95 px-5 backdrop-blur transition-[padding] duration-200 lg:px-8 ${
        collapsed ? "lg:ml-[86px]" : "lg:ml-[260px]"
      }`}
    >
      <div className="ml-12 flex items-center gap-4 lg:ml-0">
        <span className="grid size-11 place-items-center text-[#F4F7F5]">
          <Crosshair size={29} strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="text-lg font-semibold uppercase tracking-wide text-[#F4F7F5] sm:text-xl">Phishing Scanner</h1>
          <p className="hidden text-sm text-[#A8B3AD] sm:block">Analyze suspicious messages and links</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-md border border-[#8d84e8]/25 bg-[#8d84e8]/10 px-2.5 py-1 font-mono text-xs text-[#DCD8FF] sm:block">
          v1.1.5
        </div>
        <div className="flex items-center gap-2 text-sm text-[#F4F7F5]">
          <ShieldCheck className="text-[#8d84e8]" size={24} />
          Protection Active
        </div>
      </div>
    </header>
  );
}
