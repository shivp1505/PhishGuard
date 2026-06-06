"use client";

import { AnalyzeResponse } from "./types";

const reportStorageKey = "phishguard:lastReport";
const reportIdPrefix = "phishguard:report:";
const maxStoredReports = 8;
const maxStoredReportAgeMs = 24 * 60 * 60 * 1000;

function browserSupportsStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  if (!isRecord(value)) return false;

  const validRiskLevels = ["Low", "Medium", "High", "Critical"];
  const validConfidence = ["Low", "Moderate", "High"];
  const validSeverities = ["Low", "Medium", "High"];

  return (
    value.success === true &&
    typeof value.riskScore === "number" &&
    Number.isFinite(value.riskScore) &&
    value.riskScore >= 0 &&
    value.riskScore <= 100 &&
    typeof value.riskLevel === "string" &&
    validRiskLevels.includes(value.riskLevel) &&
    typeof value.verdict === "string" &&
    typeof value.confidence === "string" &&
    validConfidence.includes(value.confidence) &&
    typeof value.evidenceStrength === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.indicators) &&
    value.indicators.every(
      (indicator) =>
        isRecord(indicator) &&
        typeof indicator.type === "string" &&
        typeof indicator.severity === "string" &&
        validSeverities.includes(indicator.severity) &&
        typeof indicator.description === "string" &&
        isStringArray(indicator.matches) &&
        typeof indicator.score === "number" &&
        Number.isFinite(indicator.score)
    ) &&
    isStringArray(value.notFound) &&
    isStringArray(value.recommendations)
  );
}

function parseReportJson(saved: string | null) {
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    return isAnalyzeResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getStoredReportEntries() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return [];

  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(reportIdPrefix))
    .map((key) => {
      const timestamp = Number(key.slice(reportIdPrefix.length).split("-")[0]);
      return {
        key,
        timestamp: Number.isFinite(timestamp) ? timestamp : 0
      };
    })
    .sort((left, right) => right.timestamp - left.timestamp);
}

function cleanupStoredReports() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;

  const now = Date.now();
  const entries = getStoredReportEntries();

  entries.forEach((entry, index) => {
    const expired = entry.timestamp > 0 && now - entry.timestamp > maxStoredReportAgeMs;
    if (expired || index >= maxStoredReports) {
      window.localStorage.removeItem(entry.key);
    }
  });
}

export function saveReport(result: AnalyzeResponse) {
  if (!browserSupportsStorage()) return;
  window.sessionStorage.setItem(reportStorageKey, JSON.stringify(result));
}

export function saveReportById(result: AnalyzeResponse) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null;

  cleanupStoredReports();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(`${reportIdPrefix}${id}`, JSON.stringify(result));
  cleanupStoredReports();
  return id;
}

export function loadReportById(id: string) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null;

  try {
    cleanupStoredReports();
    const saved = window.localStorage.getItem(`${reportIdPrefix}${id}`);
    return parseReportJson(saved);
  } catch {
    return null;
  }
}

export function loadSavedReport() {
  if (!browserSupportsStorage()) return null;

  try {
    const saved = window.sessionStorage.getItem(reportStorageKey);
    return parseReportJson(saved);
  } catch {
    return null;
  }
}

export function clearReportStorage() {
  if (typeof window === "undefined") return;

  if (typeof window.sessionStorage !== "undefined") {
    window.sessionStorage.removeItem(reportStorageKey);
  }

  if (typeof window.localStorage !== "undefined") {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(reportIdPrefix)) {
        window.localStorage.removeItem(key);
      }
    }
  }
}

export function buildLocalReportHref(result: AnalyzeResponse) {
  const id = saveReportById(result);
  return id ? `/report?id=${encodeURIComponent(id)}` : "/report";
}
