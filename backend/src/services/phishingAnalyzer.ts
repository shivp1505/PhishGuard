import { keywordRules, shortenedUrlDomains } from "../data/rules";
import { analyzeUrl, getRootDomain } from "./domainIntelligence";
import { AnalyzeRequest, AnalyzeResponse, ConfidenceLevel, Indicator, RiskLevel } from "../types/analysis";

const urlRegex = /\bhttps?:\/\/[^\s<>"')]+/gi;
const ipUrlRegex = /\bhttps?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?/i;
const trailingUrlPunctuationRegex = /[.,!?;:)\]}]+$/;
const emailRegex = /[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i;
const brandDomains: Record<string, string[]> = {
  adobe: ["adobe.com"],
  amazon: ["amazon.com"],
  apple: ["apple.com"],
  chase: ["chase.com"],
  dhl: ["dhl.com"],
  paypal: ["paypal.com"],
  microsoft: ["microsoft.com", "office.com", "microsoftonline.com"],
  google: ["google.com", "gmail.com"],
  linkedin: ["linkedin.com"],
  netflix: ["netflix.com"],
  zoom: ["zoom.us"],
  github: ["github.com"],
  dropbox: ["dropbox.com"],
  docusign: ["docusign.com", "docusign.net"],
  fedex: ["fedex.com"],
  ups: ["ups.com"],
  rutgers: ["rutgers.edu"]
};
const executableAttachmentExtensions = ["exe", "scr", "js", "vbs", "bat", "cmd", "iso"];
const riskyAttachmentExtensions = [
  ...executableAttachmentExtensions,
  "html",
  "htm",
  "zip",
  "rar",
  "7z",
  "docm",
  "xlsm",
  "pptm"
];

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function extractUrls(text: string): string[] {
  return unique((text.match(urlRegex) ?? []).map((url) => url.replace(trailingUrlPunctuationRegex, "")));
}

function extractDomainLikeText(text: string): string[] {
  return unique((text.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi) ?? []).map((value) => value.toLowerCase()));
}

function extractPatternMatches(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = [];

  for (const pattern of patterns) {
    const result = text.match(pattern);
    if (result?.[0]) {
      matches.push(result[0]);
    }
  }

  return unique(matches);
}

function getSeverity(score: number): Indicator["severity"] {
  if (score >= 18) return "High";
  if (score >= 10) return "Medium";
  return "Low";
}

function parseSender(sender: string) {
  const trimmed = sender.trim();
  const emailMatch = trimmed.match(emailRegex);
  const email = emailMatch?.[0]?.toLowerCase() ?? "";
  const domain = emailMatch?.[1]?.toLowerCase() ?? "";
  const displayName = email
    ? trimmed.replace(email, "").replace(/[<>"']/g, " ").replace(/\s+/g, " ").trim().toLowerCase()
    : trimmed.toLowerCase();

  return {
    displayName,
    email,
    domain,
    rootDomain: domain ? getRootDomain(domain) : ""
  };
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

function hasActionableEvidence(indicators: Indicator[]): boolean {
  return indicators.some(
    (indicator) =>
      indicator.score >= 10 ||
      indicator.type === "Suspicious Link" ||
      indicator.type === "Sender Mismatch" ||
      indicator.type === "Sender Identity Mismatch" ||
      indicator.type === "Link Text Mismatch" ||
      indicator.type === "Attachment Warning"
  );
}

function riskIndicators(indicators: Indicator[]): Indicator[] {
  return indicators.filter((indicator) => indicator.score > 0);
}

function hasOnlyContextualEvidence(indicators: Indicator[]): boolean {
  return indicators.length > 0 && indicators.every((indicator) => indicator.score === 0);
}

function getConfidence(indicators: Indicator[], score: number): ConfidenceLevel {
  const scoringIndicators = riskIndicators(indicators);
  const strongSignals = scoringIndicators.filter((indicator) => indicator.score >= 15).length;
  if (score >= 50 || strongSignals >= 2) return "High";
  if (score >= 15 || scoringIndicators.length >= 2) return "Moderate";
  return "Low";
}

function getEvidenceStrength(confidence: ConfidenceLevel, indicators: Indicator[]): string {
  if (confidence === "High") return "Strong evidence";
  if (confidence === "Moderate") return "Moderate evidence";
  if (riskIndicators(indicators).length > 0) return "Low evidence";
  if (indicators.length > 0) return "Context only";
  return "No clear evidence";
}

function getVerdict(riskScore: number, riskLevel: RiskLevel, confidence: ConfidenceLevel): string {
  if (riskScore <= 9 && confidence === "Low") return "Likely safe based on submitted text";
  if (riskLevel === "Low") return "Low risk, verify if unexpected";
  if (riskLevel === "Medium") return "Suspicious, review before acting";
  if (riskLevel === "High") return "High risk phishing indicators";
  return "Critical phishing risk";
}

function getMissingEvidence(indicators: Indicator[], text: string): string[] {
  const foundTypes = indicators.map((indicator) => indicator.type);
  const missing: string[] = [];

  if (!foundTypes.some((type) => type.includes("Suspicious Link")) && extractUrls(text).length === 0) {
    missing.push("No suspicious links detected");
  }
  if (!foundTypes.some((type) => type.includes("Credential"))) {
    missing.push("No direct password or login request found");
  }
  if (!foundTypes.some((type) => type.includes("Financial"))) {
    missing.push("No payment or banking pressure found");
  }
  if (!foundTypes.some((type) => type.includes("Attachment"))) {
    missing.push("No attachment download request found");
  }

  return missing;
}

function detectDomainContext(text: string): Indicator | null {
  const urls = extractUrls(text);
  const officialMatches: string[] = [];
  const sharedContentMatches: string[] = [];

  for (const rawUrl of urls) {
    const analysis = analyzeUrl(rawUrl);
    if (analysis?.trustedDomain && analysis.isSharedContent) {
      sharedContentMatches.push(`${rawUrl} (${analysis.trustedDomain.service})`);
    } else if (analysis?.trustedDomain) {
      officialMatches.push(`${rawUrl} (${analysis.trustedDomain.service})`);
    }
  }

  if (sharedContentMatches.length > 0) {
    return {
      type: "Shared Content Link",
      severity: "Low",
      score: 8,
      description:
        "The message links to a legitimate platform that can host user-created forms, files, or pages. This is not automatically phishing, but it deserves extra review when the message asks for information or action.",
      matches: unique(sharedContentMatches),
      metadata: {
        domainVerdict: "shared-content"
      }
    };
  }

  if (officialMatches.length === 0) return null;

  return {
    type: "Known Service Link",
    severity: "Low",
    score: 0,
    description:
      "The message links to a commonly used service domain. This lowers URL concern, but it does not prove the message is legitimate by itself.",
    matches: unique(officialMatches),
    metadata: {
      domainVerdict: "known-service"
    }
  };
}

function detectLinks(text: string): Indicator | null {
  const urls = extractUrls(text);
  const matches: string[] = [];
  const rootDomains: string[] = [];
  let score = 0;
  let severity: Indicator["severity"] = "Low";

  for (const rawUrl of urls) {
    const analysis = analyzeUrl(rawUrl);

    if (!analysis) {
      matches.push(`${rawUrl} (unusual URL format)`);
      score += 15;
      severity = "Medium";
      continue;
    }

    const hostname = analysis.hostname;
    const trusted = analysis.isTrustedService;
    rootDomains.push(analysis.rootDomain);

    if (analysis.isLookalike) {
      matches.push(`${rawUrl} (possible lookalike of ${analysis.lookalikeTarget})`);
      score += 30;
      severity = "High";
    }
    if (analysis.protocol === "http:" && !trusted) {
      matches.push(`${rawUrl} (uses HTTP)`);
      score += 10;
      severity = severity === "High" ? "High" : "Medium";
    }
    if (shortenedUrlDomains.includes(hostname)) {
      matches.push(`${rawUrl} (shortened URL)`);
      score += 18;
      severity = "High";
    }
    if (ipUrlRegex.test(rawUrl)) {
      matches.push(`${rawUrl} (IP address URL)`);
      score += 25;
      severity = "High";
    }
    if (/[@%]|-{2,}/.test(hostname) && !trusted) {
      matches.push(`${rawUrl} (unusual domain characters)`);
      score += 10;
      severity = severity === "High" ? "High" : "Medium";
    }
    if (/login|signin|verify|account|secure/i.test(rawUrl) && !trusted) {
      matches.push(`${rawUrl} (account action link)`);
      score += 12;
      severity = severity === "High" ? "High" : "Medium";
    }
  }

  const uniqueRootDomains = unique(rootDomains);
  if (uniqueRootDomains.length > 1) {
    matches.push(`Multiple different link domains: ${uniqueRootDomains.join(", ")}`);
    score += 8;
    severity = severity === "High" ? "High" : "Medium";
  } else if (urls.length > 1) {
    matches.push("Multiple links to the same domain");
    score += 3;
  }

  const cleanMatches = unique(matches);
  if (cleanMatches.length === 0) return null;

  return {
    type: "Suspicious Link",
    severity,
    score: Math.min(score, 35),
    description: "The message contains links with properties commonly seen in phishing attempts.",
    matches: cleanMatches
  };
}

function detectRiskyAttachmentFilenames(text: string): Indicator | null {
  const extensionPattern = riskyAttachmentExtensions.join("|");
  const fileRegex = new RegExp(`\\b[\\w .-]+\\.(${extensionPattern})\\b`, "gi");
  const rawMatches = text.match(fileRegex) ?? [];
  const matches = unique(rawMatches.map((match) => match.trim()));
  if (matches.length === 0) return null;

  const hasExecutable = matches.some((match) => {
    const extension = match.split(".").pop()?.toLowerCase() ?? "";
    return executableAttachmentExtensions.includes(extension);
  });
  const hasMacroDocument = matches.some((match) => /\.(docm|xlsm|pptm)$/i.test(match));
  const score = hasExecutable ? 22 : hasMacroDocument ? 18 : 14;

  return {
    type: "Risky Attachment Name",
    severity: getSeverity(score),
    score,
    description:
      "The message references a file type that is commonly abused for credential theft or malware delivery. File names alone are not proof, but they are a strong reason to verify the sender before opening anything.",
    matches
  };
}

function detectLinkTextMismatch(text: string): Indicator | null {
  const matches: string[] = [];
  const markdownLinks = text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi);
  const htmlLinks = text.matchAll(/<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi);

  function addIfMismatch(label: string, rawUrl: string) {
    const labelDomains = extractDomainLikeText(label);
    if (labelDomains.length === 0) return;

    const analysis = analyzeUrl(rawUrl.replace(trailingUrlPunctuationRegex, ""));
    if (!analysis) return;

    for (const labelDomain of labelDomains) {
      const labelRoot = getRootDomain(labelDomain);
      if (labelRoot && labelRoot !== analysis.rootDomain) {
        matches.push(`${labelDomain} displays as ${analysis.hostname}`);
      }
    }
  }

  for (const match of markdownLinks) {
    addIfMismatch(match[1] ?? "", match[2] ?? "");
  }

  for (const match of htmlLinks) {
    addIfMismatch((match[2] ?? "").replace(/<[^>]+>/g, " "), match[1] ?? "");
  }

  const cleanMatches = unique(matches);
  if (cleanMatches.length === 0) return null;

  return {
    type: "Link Text Mismatch",
    severity: "High",
    score: 20,
    description:
      "The visible link text references one domain, but the actual destination points somewhere else. This is a common phishing technique.",
    matches: cleanMatches
  };
}

function detectSenderMismatch(input: AnalyzeRequest): Indicator | null {
  const sender = input.sender?.toLowerCase().trim();
  const text = `${input.subject ?? ""} ${input.message} ${input.url ?? ""}`.toLowerCase();
  if (!sender || !sender.includes("@")) return null;

  const senderRootDomain = parseSender(sender).rootDomain;
  const urls = extractUrls(text);
  const mismatches = urls.filter((rawUrl) => {
    const analysis = analyzeUrl(rawUrl);
    if (!analysis) return false;

    if (analysis.isTrustedService) {
      return false;
    }

    return senderRootDomain && analysis.rootDomain !== senderRootDomain;
  });

  if (mismatches.length === 0) return null;

  return {
    type: "Sender Mismatch",
    severity: "Medium",
    score: 12,
    description:
      "The sender domain does not match at least one non-service link domain. This can be normal for shared tools, but unknown external links deserve review.",
    matches: mismatches
  };
}

function detectSenderIdentityMismatch(input: AnalyzeRequest): Indicator | null {
  const sender = parseSender(input.sender ?? "");
  if (!sender.domain) return null;

  const matches: string[] = [];
  const senderText = `${sender.displayName} ${sender.email}`.toLowerCase();

  for (const [brand, domains] of Object.entries(brandDomains)) {
    if (!senderText.includes(brand)) continue;
    if (!domains.some((domain) => sender.rootDomain === domain || sender.domain.endsWith(`.${domain}`))) {
      matches.push(`${brand} name used with ${sender.domain}`);
    }
  }

  if (matches.length === 0) return null;

  return {
    type: "Sender Identity Mismatch",
    severity: "High",
    score: 15,
    description:
      "The sender name or address references a recognizable organization, but the email domain does not match that organization.",
    matches: unique(matches)
  };
}

function detectWritingQuality(text: string): Indicator | null {
  const normalized = text.trim();
  if (normalized.length < 45) return null;

  const matches: string[] = [];
  const typoPatterns = [
    /\bverifiy\b/i,
    /\bverfy\b/i,
    /\bimmediatly\b/i,
    /\bsecurty\b/i,
    /\bpassw0rd\b/i,
    /\bacc0unt\b/i,
    /\bre-enter\b/i,
    /\brecieve\b/i,
    /\bkindly\b/i
  ];
  const typoMatches = extractPatternMatches(normalized, typoPatterns);
  matches.push(...typoMatches);

  if (/[!?]{3,}/.test(normalized)) {
    matches.push("repeated punctuation");
  }
  if (/\b[A-Z]{8,}\b/.test(normalized) && (normalized.match(/\b[A-Z]{8,}\b/g) ?? []).length >= 2) {
    matches.push("multiple all-caps words");
  }
  if (/\b(?:[A-Za-z]\s){4,}[A-Za-z]\b/.test(normalized)) {
    matches.push("unusual spacing");
  }

  const cleanMatches = unique(matches);
  if (cleanMatches.length === 0) return null;

  const score = Math.min(12, 5 + cleanMatches.length * 3);

  return {
    type: "Writing Quality Warning",
    severity: getSeverity(score),
    score,
    description:
      "The message contains writing patterns often seen in low-effort phishing attempts, such as misspellings, unusual spacing, all-caps pressure, or repeated punctuation.",
    matches: cleanMatches
  };
}

function buildSummary(input: AnalyzeRequest, riskScore: number, riskLevel: RiskLevel, indicators: Indicator[]): string {
  if (indicators.length === 0) {
    return "No phishing indicators were detected in the submitted text. This does not prove the message is safe, but there is not enough evidence here to rate it suspicious.";
  }

  if (hasOnlyContextualEvidence(indicators)) {
    return "No suspicious phishing behavior was detected. PhishGuard recognized a common service domain, but users should still verify unexpected messages through normal trusted channels.";
  }

  if (
    riskScore <= 9 &&
    indicators.some((indicator) => indicator.type === "Shared Content Link") &&
    indicators.every((indicator) => indicator.type === "Shared Content Link" || indicator.score === 0)
  ) {
    return "This is a low-evidence result. PhishGuard found a shared-content link that can host user-created forms, files, or pages, but the submitted text does not include urgency, credential instructions, payment pressure, or an attachment request.";
  }

  if (riskScore <= 9 && !hasActionableEvidence(indicators)) {
    const bodyLength = input.message.trim().length;
    return `This is a very low-evidence result. PhishGuard found weak wording in the subject, but the ${bodyLength <= 20 ? "short " : ""}message body does not include links, urgency, credential instructions, payment pressure, or an attachment request.`;
  }

  if (riskLevel === "Low") {
    return "This message has limited phishing evidence. Review the detected signal, but the submitted text does not contain enough context for a stronger phishing assessment.";
  }

  if (indicators.some((indicator) => indicator.type === "Known Service Link")) {
    return `This message is rated ${riskLevel} risk because suspicious language appears around a known service link. The service domain may be legitimate, but the message still contains phishing-style context that should be verified.`;
  }

  const names = indicators.slice(0, 3).map((indicator) => indicator.type.toLowerCase());
  return `This message is rated ${riskLevel} risk because it contains ${names.join(", ")}${indicators.length > 3 ? ", and other warning signs" : ""}.`;
}

function buildRecommendations(indicators: Indicator[], riskLevel: RiskLevel): string[] {
  const recommendations = new Set<string>();

  if (riskLevel === "Low" && !hasActionableEvidence(indicators)) {
    recommendations.add("No direct phishing action was found in the submitted message. Verify the sender if the message was unexpected.");
    recommendations.add("Ask for more context through an official channel before trusting a vague security-related subject.");
    recommendations.add("Do not share passwords, codes, or personal information unless you are on a verified official website.");
    return Array.from(recommendations);
  }

  if (riskLevel === "High" || riskLevel === "Critical") {
    recommendations.add("Do not click links or download attachments in this message.");
    recommendations.add("Verify the sender through an official website, phone number, or trusted contact method.");
  }

  if (indicators.some((indicator) => indicator.type.includes("Credential") && indicator.score >= 10)) {
    recommendations.add("Do not enter passwords, verification codes, or personal details from links in this message.");
  }

  if (indicators.some((indicator) => indicator.type.includes("Financial"))) {
    recommendations.add("Go directly to the official bank, billing, or payment website instead of using message links.");
  }

  if (indicators.some((indicator) => indicator.type.includes("Attachment"))) {
    recommendations.add("Do not open attachments unless you can confirm the sender and expected file.");
  }

  if (indicators.some((indicator) => indicator.type === "Sender Identity Mismatch")) {
    recommendations.add("Do not trust the display name alone. Compare the sender email domain with the organization it claims to represent.");
  }

  if (indicators.some((indicator) => indicator.type === "Link Text Mismatch")) {
    recommendations.add("Hover or inspect links before clicking. The visible link text may not match the real destination.");
  }

  if (indicators.some((indicator) => indicator.type === "Writing Quality Warning")) {
    recommendations.add("Treat unusual spelling, spacing, or punctuation as a supporting warning sign, not proof by itself.");
  }

  recommendations.add("Report the message to IT or security if it was sent to a school or work account.");
  recommendations.add("When unsure, slow down and verify before responding.");

  return Array.from(recommendations);
}

export function analyzeMessage(input: AnalyzeRequest): AnalyzeResponse {
  const senderText = input.sender ?? "";
  const subjectText = input.subject ?? "";
  const messageText = input.message ?? "";
  const urlText = input.url ?? "";
  const text = `${senderText}\n${subjectText}\n${messageText}\n${urlText}`;
  const indicators: Indicator[] = [];

  for (const rule of keywordRules) {
    const subjectMatches = extractPatternMatches(subjectText, rule.patterns);
    const bodyMatches = extractPatternMatches(messageText, rule.patterns);
    const senderMatches = extractPatternMatches(senderText, rule.patterns);
    const urlMatches = extractPatternMatches(urlText, rule.patterns);
    const matches = unique([...bodyMatches, ...urlMatches, ...subjectMatches, ...senderMatches]);

    if (matches.length > 0) {
      const hasBodyOrUrlMatch = bodyMatches.length > 0 || urlMatches.length > 0;
      const subjectOnly = subjectMatches.length > 0 && !hasBodyOrUrlMatch && senderMatches.length === 0;
      const score = subjectOnly ? Math.max(3, Math.round(rule.score * 0.25)) : rule.score;
      const description = subjectOnly
        ? "The subject line contains security or account-related wording, but the message body does not include a direct request, link, attachment, or payment instruction. This is a weak signal by itself."
        : rule.description;

      indicators.push({
        type: subjectOnly ? "Weak Subject Signal" : rule.type,
        severity: subjectOnly ? "Low" : getSeverity(score),
        description,
        matches,
        score
      });
    }
  }

  const linkIndicator = detectLinks(text);
  if (linkIndicator) indicators.push(linkIndicator);

  const linkTextMismatchIndicator = detectLinkTextMismatch(text);
  if (linkTextMismatchIndicator) indicators.push(linkTextMismatchIndicator);

  const domainContextIndicator = detectDomainContext(text);
  if (domainContextIndicator) indicators.push(domainContextIndicator);

  const riskyAttachmentIndicator = detectRiskyAttachmentFilenames(text);
  if (riskyAttachmentIndicator) indicators.push(riskyAttachmentIndicator);

  const mismatchIndicator = detectSenderMismatch(input);
  if (mismatchIndicator) indicators.push(mismatchIndicator);

  const senderIdentityMismatchIndicator = detectSenderIdentityMismatch(input);
  if (senderIdentityMismatchIndicator) indicators.push(senderIdentityMismatchIndicator);

  const writingQualityIndicator = detectWritingQuality(`${subjectText}\n${messageText}`);
  if (writingQualityIndicator) indicators.push(writingQualityIndicator);

  const trustedContextIndicator = indicators.find((indicator) => indicator.type === "Known Service Link");
  if (trustedContextIndicator && indicators.some((indicator) => indicator.score > 0)) {
    trustedContextIndicator.description =
      "The message links to a commonly used service domain. The domain itself is not suspicious, but the surrounding wording still contains phishing indicators.";
    trustedContextIndicator.metadata = {
      ...trustedContextIndicator.metadata,
      domainVerdict: "known-service-with-risk-context"
    };
  }

  const sharedContentIndicator = indicators.find((indicator) => indicator.type === "Shared Content Link");
  const hasSharedContentRiskContext = indicators.some(
    (indicator) =>
      indicator.type === "Credential Request" ||
      indicator.type === "Financial Pressure" ||
      indicator.type === "Urgency" ||
      indicator.type === "Social Engineering" ||
      indicator.type === "Risky Attachment Name"
  );
  if (sharedContentIndicator && hasSharedContentRiskContext) {
    sharedContentIndicator.severity = "Medium";
    sharedContentIndicator.score = Math.max(sharedContentIndicator.score, 14);
    sharedContentIndicator.description =
      "The message links to a shared-content platform and also asks for sensitive action or uses pressure. These platforms can be legitimate, but attackers often use hosted forms or files to collect credentials and payments.";
    sharedContentIndicator.metadata = {
      ...sharedContentIndicator.metadata,
      domainVerdict: "shared-content-with-risk-context"
    };
  }

  const riskScore = Math.min(
    100,
    indicators.reduce((total, indicator) => total + indicator.score, 0)
  );
  const riskLevel = getRiskLevel(riskScore);
  const confidence = getConfidence(indicators, riskScore);
  const evidenceStrength = getEvidenceStrength(confidence, indicators);

  return {
    success: true,
    riskScore,
    riskLevel,
    verdict: getVerdict(riskScore, riskLevel, confidence),
    confidence,
    evidenceStrength,
    summary: buildSummary(input, riskScore, riskLevel, indicators),
    indicators,
    notFound: getMissingEvidence(indicators, text),
    recommendations: buildRecommendations(indicators, riskLevel)
  };
}
