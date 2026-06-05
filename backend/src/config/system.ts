import { keywordRules, shortenedUrlDomains } from "../data/rules";
import { protectedBrandDomains, trustedDomains } from "../data/trustedDomains";

export const systemInfo = {
  backendVersion: "1.0.0",
  engine: "rule-based-v1",
  releaseStage: "V1 deployment prep",
  rulesetVersion: "ruleset-2026.06.05",
  uiBuild: "v1-readiness-01",
  lastUpdated: "2026-06-05",
  metrics: {
    keywordRules: keywordRules.length,
    trustedDomains: trustedDomains.length,
    protectedBrands: protectedBrandDomains.length,
    shortenedDomains: shortenedUrlDomains.length,
    trackedSources:
      keywordRules.length + trustedDomains.length + protectedBrandDomains.length + shortenedUrlDomains.length
  }
};
