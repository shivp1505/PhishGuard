import { protectedBrandDomains, trustedDomains, TrustedDomain } from "../data/trustedDomains";

const multiPartTlds = ["co.uk", "ac.uk", "edu.au", "com.au", "co.in"];

export interface DomainAnalysis {
  rawUrl: string;
  hostname: string;
  rootDomain: string;
  protocol: string;
  trustedDomain?: TrustedDomain;
  isTrustedService: boolean;
  isSharedContent: boolean;
  isLookalike: boolean;
  lookalikeTarget?: string;
  reasons: string[];
}

export function getRootDomain(hostname: string): string {
  const clean = hostname.toLowerCase().replace(/^www\./, "");
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 2) return clean;

  const lastTwo = parts.slice(-2).join(".");
  const lastThree = parts.slice(-3).join(".");
  if (multiPartTlds.includes(lastTwo) && parts.length >= 3) return lastThree;
  return lastTwo;
}

function isDomainOrSubdomain(hostname: string, domain: string): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, "");
  const cleanDomain = domain.toLowerCase().replace(/^www\./, "");
  return cleanHost === cleanDomain || cleanHost.endsWith(`.${cleanDomain}`);
}

function normalizeForLookalike(value: string): string {
  return value
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/-/g, "");
}

export function findTrustedDomain(hostname: string): TrustedDomain | undefined {
  return [...trustedDomains]
    .sort((left, right) => right.domain.length - left.domain.length)
    .find((entry) => isDomainOrSubdomain(hostname, entry.domain));
}

export function analyzeUrl(rawUrl: string): DomainAnalysis | null {
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const rootDomain = getRootDomain(hostname);
    const trustedDomain = findTrustedDomain(hostname);
    const normalizedRoot = normalizeForLookalike(rootDomain.split(".")[0] ?? rootDomain);

    const lookalikeTarget = protectedBrandDomains.find((domain) => {
      if (isDomainOrSubdomain(hostname, domain)) return false;
      const brand = domain.split(".")[0];
      return normalizeForLookalike(brand) === normalizedRoot || hostname.includes(`${brand}-`) || hostname.includes(`-${brand}`);
    });

    const reasons: string[] = [];
    if (trustedDomain) {
      reasons.push(`${trustedDomain.service} recognized as a common ${trustedDomain.category.toLowerCase()} service`);
      if (trustedDomain.trustLevel === "shared-content") {
        reasons.push("Shared-content domains can host user-created pages, files, or forms");
      }
    }
    if (lookalikeTarget) {
      reasons.push(`Possible lookalike of ${lookalikeTarget}`);
    }

    return {
      rawUrl,
      hostname,
      rootDomain,
      protocol: parsed.protocol,
      trustedDomain,
      isTrustedService: Boolean(trustedDomain),
      isSharedContent: trustedDomain?.trustLevel === "shared-content",
      isLookalike: Boolean(lookalikeTarget),
      lookalikeTarget,
      reasons
    };
  } catch {
    return null;
  }
}
