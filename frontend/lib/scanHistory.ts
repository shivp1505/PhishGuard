"use client";

import { AnalyzeRequest, AnalyzeResponse } from "./types";

export interface ScanHistoryEntry {
  id: string;
  createdAt: string;
  request: AnalyzeRequest;
  result: AnalyzeResponse;
  preview: string;
}

const historyStorageKey = "phishguard:scanHistory";
const historyEnabledKey = "phishguard:historyEnabled";
const maxHistoryItems = 8;

function supportsLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function buildPreview(request: AnalyzeRequest) {
  const fallback = request.message.trim().replace(/\s+/g, " ");
  return (request.subject?.trim() || fallback || "Untitled scan").slice(0, 90);
}

export function loadScanHistory(): ScanHistoryEntry[] {
  if (!supportsLocalStorage()) return [];

  try {
    const saved = window.localStorage.getItem(historyStorageKey);
    return saved ? (JSON.parse(saved) as ScanHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function isScanHistoryEnabled() {
  if (!supportsLocalStorage()) return false;
  return window.localStorage.getItem(historyEnabledKey) === "true";
}

export function setScanHistoryEnabled(enabled: boolean) {
  if (!supportsLocalStorage()) return;
  window.localStorage.setItem(historyEnabledKey, String(enabled));
  if (!enabled) {
    window.localStorage.removeItem(historyStorageKey);
  }
  window.dispatchEvent(new Event("phishguard:history-updated"));
}

export function saveScanHistory(request: AnalyzeRequest, result: AnalyzeResponse) {
  if (!supportsLocalStorage()) return [];
  if (!isScanHistoryEnabled()) return loadScanHistory();

  const entry: ScanHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    request,
    result,
    preview: buildPreview(request)
  };
  const nextHistory = [entry, ...loadScanHistory()].slice(0, maxHistoryItems);
  window.localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
  window.dispatchEvent(new Event("phishguard:history-updated"));
  return nextHistory;
}

export function clearScanHistory() {
  if (!supportsLocalStorage()) return;
  window.localStorage.removeItem(historyStorageKey);
  window.dispatchEvent(new Event("phishguard:history-updated"));
}

export function clearAllLocalScanData() {
  if (!supportsLocalStorage()) return;
  window.localStorage.removeItem(historyStorageKey);
  window.localStorage.removeItem(historyEnabledKey);
  window.dispatchEvent(new Event("phishguard:history-updated"));
}
