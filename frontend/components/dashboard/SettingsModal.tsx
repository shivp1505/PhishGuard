"use client";

import { History, RotateCcw, Trash2, X } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { clearReportStorage } from "@/lib/reportStorage";
import {
  clearAllLocalScanData,
  clearScanHistory,
  isScanHistoryEnabled,
  loadScanHistory,
  ScanHistoryEntry,
  setScanHistoryEnabled
} from "@/lib/scanHistory";
import { AnalyzeRequest } from "@/lib/types";
import { CommandButton } from "./CommandButton";

const privacyAckKey = "phishguard:privacyAcknowledged";

function formatScanTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function SettingsModal({
  open,
  onClose,
  onLoadHistory
}: {
  open: boolean;
  onClose: () => void;
  onLoadHistory: (request: AnalyzeRequest) => void;
}) {
  const [historyEnabled, setHistoryEnabledState] = useState(false);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refresh() {
      setHistoryEnabledState(isScanHistoryEnabled());
      setHistory(loadScanHistory());
      setPrivacyAccepted(window.localStorage.getItem(privacyAckKey) === "true");
    }

    if (open) refresh();
    window.addEventListener("phishguard:history-updated", refresh);
    window.addEventListener("phishguard:privacy-updated", refresh);

    return () => {
      window.removeEventListener("phishguard:history-updated", refresh);
      window.removeEventListener("phishguard:privacy-updated", refresh);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 0);
  }, [open]);

  if (!open) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function toggleHistory() {
    const next = !historyEnabled;
    setScanHistoryEnabled(next);
    setHistoryEnabledState(next);
  }

  function clearLocalData() {
    clearAllLocalScanData();
    clearReportStorage();
    window.localStorage.removeItem(privacyAckKey);
    window.dispatchEvent(new Event("phishguard:privacy-updated"));
    setHistory([]);
    setPrivacyAccepted(false);
  }

  function resetPrivacyAcknowledgement() {
    window.localStorage.removeItem(privacyAckKey);
    window.dispatchEvent(new Event("phishguard:privacy-updated"));
    setPrivacyAccepted(false);
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      <div ref={modalRef} className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-white/10 bg-[#0D1114] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F7A75]">Command Center</p>
            <h2 className="text-lg font-semibold uppercase tracking-wide">Settings</h2>
          </div>
          <button data-autofocus className="grid size-9 place-items-center rounded-md text-[#A8B3AD] hover:bg-white/[0.06] hover:text-white" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5">
          <div className="rounded-md border border-white/10 bg-[#0A0F12] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide">Local scan history</h3>
                <p className="mt-1 text-sm leading-6 text-[#A8B3AD]">
                  Store recent scans only in this browser for quick retesting. Disabled by default for privacy.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={historyEnabled}
                onClick={toggleHistory}
                className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:bg-white/[0.07] sm:min-w-44"
              >
                <span className="text-sm font-semibold">{historyEnabled ? "Enabled" : "Disabled"}</span>
                <span className={`relative h-6 w-11 rounded-full ${historyEnabled ? "bg-[#8d84e8]" : "bg-white/15"}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-[#050708] transition-transform ${historyEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-[#0A0F12] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide">Privacy acknowledgement</h3>
                <p className="mt-1 text-sm text-[#A8B3AD]">{privacyAccepted ? "Accepted in this browser." : "Not accepted yet."}</p>
              </div>
              <CommandButton type="button" variant="secondary" onClick={resetPrivacyAcknowledgement}>
                Reset
              </CommandButton>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-[#0A0F12] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide">Local data</h3>
                <p className="mt-1 text-sm leading-6 text-[#A8B3AD]">Clear scan history, report cache, and privacy acknowledgement.</p>
              </div>
              <CommandButton type="button" variant="danger" onClick={clearLocalData}>
                <Trash2 size={16} />
                Clear local data
              </CommandButton>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-[#0A0F12] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                <History size={16} />
                Recent scans
              </h3>
              <CommandButton type="button" variant="ghost" onClick={clearScanHistory} className="min-h-9 px-2 text-xs">
                Clear
              </CommandButton>
            </div>
            <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-[#6F7A75]">No recent scans are stored in this browser.</p>
              ) : (
                history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onLoadHistory(entry.request);
                      onClose();
                    }}
                    className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold">{entry.preview}</p>
                      <span className="font-mono text-xs text-[#A8B3AD]">{entry.result.riskScore}/100</span>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-xs text-[#6F7A75]">
                      <RotateCcw size={12} />
                      {formatScanTime(entry.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
