import { keywordRules, shortenedUrlDomains } from "../data/rules";
import { protectedBrandDomains, trustedDomains } from "../data/trustedDomains";

export const systemInfo = {
  backendVersion: "1.1.0",
  engine: "rule-based-v1",
  releaseStage: "V1 production",
  rulesetVersion: "ruleset-2026.06.05-v1.1",
  uiBuild: "v1.1-production-01",
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
