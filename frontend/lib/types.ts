export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type Severity = "Low" | "Medium" | "High";
export type ConfidenceLevel = "Low" | "Moderate" | "High";

export interface AnalyzeRequest {
  sender?: string;
  subject?: string;
  message: string;
  url?: string;
}

export interface Indicator {
  type: string;
  severity: Severity;
  description: string;
  matches: string[];
  score: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface AnalyzeResponse {
  success: true;
  riskScore: number;
  riskLevel: RiskLevel;
  verdict: string;
  confidence: ConfidenceLevel;
  evidenceStrength: string;
  summary: string;
  indicators: Indicator[];
  notFound: string[];
  recommendations: string[];
}
