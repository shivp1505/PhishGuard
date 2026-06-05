import { AnalyzeRequest, AnalyzeResponse } from "./types";
import { fetchWithTimeout } from "./fetchTimeout";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function analyzeMessage(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${apiUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }, 10000);
  } catch {
    throw new Error("PhishGuard cannot reach the analysis server. Make sure the backend is running and try again.");
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Unable to analyze the message.");
  }

  return data;
}
