"use client";

import {
  BookOpen,
  ChevronLeft,
  FileText,
  Headphones,
  Info,
  Menu,
  ScanSearch,
  ScrollText,
  Settings,
  X
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PhishGuardMark } from "../PhishGuardMark";
import { StatusDot } from "./DashboardPanel";

type HealthState = {
  online: boolean;
  status: string;
  service: string;
  version: string;
  engine: string;
  releaseStage: string;
  rulesetVersion: string;
  uiBuild: string;
  lastUpdated: string;
  message?: string;
  metrics: {
    keywordRules: number;
    trustedDomains: number;
    protectedBrands: number;
    shortenedDomains: number;
    trackedSources?: number;
  } | null;
  checkedAt: string | null;
};

const navItems = [
  { label: "Scanner", href: "#top", icon: ScanSearch },
  { label: "Reports", href: "/report", icon: FileText },
  { label: "Learn", href: "#learn", icon: BookOpen },
  { label: "About", href: "#about", icon: Info },
  { label: "Docs", href: "/docs", icon: ScrollText }
];

function useHealth() {
  const [health, setHealth] = useState<HealthState>({
    online: false,
    status: "checking",
    service: "phishguard-backend",
    version: "checking",
    engine: "checking",
    releaseStage: "checking",
    rulesetVersion: "checking",
    uiBuild: "v1-local",
    lastUpdated: "checking",
    metrics: null,
    checkedAt: null
  });

  useEffect(() => {
    let active = true;

    async function check() {
      const warmingTimer = window.setTimeout(() => {
        if (!active) return;
        setHealth((current) =>
          current.online
            ? current
            : {
                ...current,
                online: false,
                status: "waking",
                engine: current.engine === "checking" ? "warming" : current.engine,
                releaseStage: current.releaseStage === "checking" ? "waking" : current.releaseStage,
                message: "Waking the analysis server...",
                checkedAt: new Date().toISOString()
              }
        );
      }, 2500);

      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const data = await response.json();
        if (!active) return;
        setHealth({
          online: response.ok && Boolean(data.online),
          status: data.status ?? (response.ok ? "ok" : "offline"),
          service: data.service ?? "phishguard-backend",
          version: data.version ?? "1.0.0",
          engine: data.engine ?? "rule-based-v1",
          releaseStage: data.releaseStage ?? "V1 local",
          rulesetVersion: data.rulesetVersion ?? "ruleset-unknown",
          uiBuild: data.uiBuild ?? "v1-local",
          lastUpdated: data.lastUpdated ?? "unknown",
          metrics: data.metrics ?? null,
          message: data.message,
          checkedAt: new Date().toISOString()
        });
      } catch {
        if (active) {
          setHealth({
            online: false,
            status: "offline",
            service: "phishguard-backend",
            version: "unknown",
            engine: "offline",
            releaseStage: "offline",
            rulesetVersion: "unknown",
            uiBuild: "v1-local",
            lastUpdated: "unknown",
            metrics: null,
            message: "The analysis server could not be reached.",
            checkedAt: new Date().toISOString()
          });
        }
      } finally {
        window.clearTimeout(warmingTimer);
      }
    }

    check();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void check();
      }
    }, 45000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return health;
}

export function CommandSidebar({
  lastScanAt,
  onOpenSettings,
  onOpenHelp,
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange
}: {
  lastScanAt: string | null;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const health = useHealth();
  const pathname = usePathname();
  const [activeHref, setActiveHref] = useState("#top");
  const isWaking = health.status === "waking";
  const statusTone = health.online ? "green" : health.status === "checking" || isWaking ? "amber" : "red";
  const displayStatus = health.online ? "Operational" : isWaking ? "Waking" : health.status === "checking" ? "Checking" : "Offline";
  const displayServer = health.online ? "Online" : isWaking ? "Waking up" : health.status === "checking" ? "Checking" : "Offline";
  const statusTextClassName = health.online ? "text-[#7CFF62]" : health.status === "checking" || isWaking ? "text-[#F59E0B]" : "text-red-300";
  const sidebarWidth = collapsed ? "lg:w-[86px]" : "lg:w-[260px]";
  const formattedLastScan = lastScanAt
    ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(lastScanAt))
    : "No scan yet";
  const formattedCheckedAt = health.checkedAt
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(health.checkedAt))
    : "Not checked";
  const totalSignals =
    health.metrics?.trackedSources ??
    (health.metrics
      ? health.metrics.keywordRules + health.metrics.trustedDomains + health.metrics.protectedBrands + health.metrics.shortenedDomains
      : null);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHref("");
      return;
    }

    const sections = ["top", "learn", "about"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    function updateActiveSection() {
      const marker = window.scrollY + window.innerHeight * 0.38;
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12;
      const current = nearBottom
        ? sections[sections.length - 1]?.id ?? "top"
        : sections.reduce((active, section) => (section.offsetTop <= marker ? section.id : active), "top");
      setActiveHref(`#${current}`);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [pathname]);

  function handleNavClick(href: string) {
    onMobileOpenChange(false);

    if (!href.startsWith("#")) return;

    if (pathname !== "/") {
      window.location.href = `/${href}`;
      return;
    }

    const targetId = href.slice(1);
    setActiveHref(href);

    window.requestAnimationFrame(() => {
      if (targetId === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    });
  }

  const renderContent = (isMobile = false) => {
    const effectiveCollapsed = isMobile ? false : collapsed;

    return (
    <>
      <div className={`flex h-20 items-center border-b border-white/10 px-5 ${effectiveCollapsed ? "justify-center" : "justify-between"}`}>
        <a
          href="#top"
          className="flex items-center gap-3"
          aria-label="PhishGuard home"
          onClick={(event) => {
            event.preventDefault();
            handleNavClick("#top");
          }}
        >
          <PhishGuardMark compact={effectiveCollapsed} animate />
        </a>
        <button className="grid size-9 place-items-center rounded-md text-[#A8B3AD] hover:bg-white/[0.06] lg:hidden" onClick={() => onMobileOpenChange(false)} aria-label="Close navigation">
          <X size={18} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-6">
        {!effectiveCollapsed && <p className="px-3 font-mono text-xs uppercase tracking-[0.22em] text-[#A8B3AD]">Command Center</p>}
        <nav className="mt-4 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href.startsWith("#") ? pathname === "/" && item.href === activeHref : pathname === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`group relative flex min-h-12 items-center gap-3 rounded-sm px-3 text-sm transition ${
                  isActive
                    ? "bg-white/[0.07] text-[#8d84e8]"
                    : "text-[#A8B3AD] hover:bg-white/[0.05] hover:text-white"
                } ${effectiveCollapsed ? "justify-center" : ""}`}
                title={effectiveCollapsed ? item.label : undefined}
                onClick={(event) => {
                  if (item.href.startsWith("#")) {
                    event.preventDefault();
                    handleNavClick(item.href);
                  } else {
                    onMobileOpenChange(false);
                  }
                }}
              >
                {isActive && <span className="absolute left-0 top-2 h-8 w-1 rounded-r bg-[#8d84e8]" />}
                <Icon size={20} />
                {!effectiveCollapsed && <span>{item.label}</span>}
              </a>
            );
          })}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex min-h-12 items-center gap-3 rounded-sm px-3 text-left text-sm text-[#A8B3AD] transition hover:bg-white/[0.05] hover:text-white ${
              effectiveCollapsed ? "justify-center" : ""
            }`}
            title={effectiveCollapsed ? "Settings" : undefined}
          >
            <Settings size={20} />
            {!effectiveCollapsed && <span>Settings</span>}
          </button>
        </nav>

        <div className="mt-auto grid gap-5">
          {!effectiveCollapsed && (
            <div className="border-t border-white/10 pt-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#A8B3AD]">System Status</p>
              <dl className="mt-4 grid gap-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Overall Status</dt>
                  <dd className={`flex items-center gap-2 ${statusTextClassName}`}>
                    <StatusDot tone={statusTone} />
                    {displayStatus}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Analysis Server</dt>
                  <dd className="flex items-center gap-2 text-[#A8B3AD]">
                    <StatusDot tone={statusTone} />
                    {displayServer}
                  </dd>
                </div>
                {health.message && (
                  <div className="rounded-md border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-2 text-[#F8D58A]">
                    {health.message}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Scanner Engine</dt>
                  <dd className="font-mono text-[#F4F7F5]">{health.engine}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Release Stage</dt>
                  <dd className="text-right font-mono text-[#F4F7F5]">{health.releaseStage}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Backend Version</dt>
                  <dd className="font-mono text-[#F4F7F5]">{health.version}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Ruleset</dt>
                  <dd className="text-right font-mono text-[#F4F7F5]">{health.rulesetVersion}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">UI Build</dt>
                  <dd className="font-mono text-[#F4F7F5]">{health.uiBuild}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Tracked Signals</dt>
                  <dd className="font-mono text-[#F4F7F5]">{totalSignals ?? "unknown"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Updated</dt>
                  <dd className="font-mono text-[#F4F7F5]">{health.lastUpdated}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Status Checked</dt>
                  <dd className="font-mono text-[#F4F7F5]">{formattedCheckedAt}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#A8B3AD]">Last Scan</dt>
                  <dd className="text-right font-mono text-[#F4F7F5]">{formattedLastScan}</dd>
                </div>
              </dl>
            </div>
          )}

          {!effectiveCollapsed && (
            <button type="button" onClick={onOpenHelp} className="flex min-h-12 items-center justify-center gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 text-sm text-[#A8B3AD] hover:bg-white/[0.06] hover:text-white">
              <Headphones size={18} />
              Need Help?
            </button>
          )}

          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className={`hidden min-h-12 items-center gap-3 border-t border-white/10 px-3 text-sm text-[#A8B3AD] hover:text-white lg:flex ${
              effectiveCollapsed ? "justify-center" : ""
            }`}
          >
            <ChevronLeft size={18} className={effectiveCollapsed ? "rotate-180" : ""} />
            {!effectiveCollapsed && "Collapse"}
          </button>
        </div>
      </div>
    </>
    );
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-[70] grid size-11 place-items-center rounded-md border border-white/10 bg-[#0D1114] text-white shadow-lg lg:hidden"
        onClick={() => onMobileOpenChange(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>
      <aside className={`fixed inset-y-0 left-0 z-[60] hidden border-r border-white/10 bg-[#070A0C] transition-all duration-200 lg:flex ${sidebarWidth} flex-col`}>
        {renderContent(false)}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <button className="absolute inset-0 bg-black/60" onClick={() => onMobileOpenChange(false)} aria-label="Close navigation overlay" />
          <aside className="relative flex h-full w-[290px] flex-col border-r border-white/10 bg-[#070A0C] shadow-2xl">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
