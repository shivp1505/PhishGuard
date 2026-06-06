import { keywordRules, shortenedUrlDomains } from "../data/rules";
import { protectedBrandDomains, trustedDomains } from "../data/trustedDomains";

export const systemInfo = {
  backendVersion: "1.1.3",
  engine: "rule-based-v1",
  releaseStage: "V1 prod",
  rulesetVersion: "rsv.1.1",
  uiBuild: "v1.1-prod4",
  lastUpdated: "2026-06-05",
  metrics: {
    keywordRules: keywordRules.length,
    keywordPatterns: keywordRules.reduce((total, rule) => total + rule.patterns.length, 0),
    trustedDomains: trustedDomains.length,
    protectedBrands: protectedBrandDomains.length,
    shortenedDomains: shortenedUrlDomains.length,
    trackedSources:
      keywordRules.reduce((total, rule) => total + rule.patterns.length, 0) +
      trustedDomains.length +
      protectedBrandDomains.length +
      shortenedUrlDomains.length
  }
};
