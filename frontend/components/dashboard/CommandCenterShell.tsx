"use client";

import { ReactNode, useState } from "react";
import { AnalyzeRequest } from "@/lib/types";
import { CommandSidebar } from "./CommandSidebar";
import { HelpModal } from "./HelpModal";
import { SettingsModal } from "./SettingsModal";
import { TopSecurityHeader } from "./TopSecurityHeader";

export function CommandCenterShell({
  lastScanAt,
  onLoadHistory,
  children
}: {
  lastScanAt: string | null;
  onLoadHistory: (request: AnalyzeRequest) => void;
  children: ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <CommandSidebar
        lastScanAt={lastScanAt}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />
      <TopSecurityHeader collapsed={sidebarCollapsed} />
      <main className={`${sidebarCollapsed ? "lg:ml-[86px]" : "lg:ml-[260px]"} transition-[margin] duration-200`}>
        {children}
      </main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onLoadHistory={onLoadHistory} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
