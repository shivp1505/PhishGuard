export interface TrustedDomain {
  domain: string;
  service: string;
  category: string;
  trustLevel: "official" | "shared-content";
}

export const trustedDomains: TrustedDomain[] = [
  { domain: "rutgers.zoom.us", service: "Rutgers Zoom", category: "Video conferencing", trustLevel: "official" },
  { domain: "zoom.us", service: "Zoom", category: "Video conferencing", trustLevel: "official" },
  { domain: "forms.gle", service: "Google Forms", category: "Shared form", trustLevel: "shared-content" },
  { domain: "docs.google.com", service: "Google Docs", category: "Shared content", trustLevel: "shared-content" },
  { domain: "sites.google.com", service: "Google Sites", category: "Shared website", trustLevel: "shared-content" },
  { domain: "google.com", service: "Google", category: "Productivity", trustLevel: "official" },
  { domain: "gmail.com", service: "Google Mail", category: "Email", trustLevel: "official" },
  { domain: "login.microsoftonline.com", service: "Microsoft Sign-in", category: "Identity", trustLevel: "official" },
  { domain: "microsoft.com", service: "Microsoft", category: "Productivity", trustLevel: "official" },
  { domain: "office.com", service: "Microsoft 365", category: "Productivity", trustLevel: "official" },
  { domain: "teams.microsoft.com", service: "Microsoft Teams", category: "Video conferencing", trustLevel: "official" },
  { domain: "github.io", service: "GitHub Pages", category: "Shared website", trustLevel: "shared-content" },
  { domain: "github.com", service: "GitHub", category: "Developer platform", trustLevel: "official" },
  { domain: "dropbox.com", service: "Dropbox", category: "Cloud storage", trustLevel: "shared-content" },
  { domain: "docusign.net", service: "DocuSign", category: "Document signing", trustLevel: "official" },
  { domain: "docusign.com", service: "DocuSign", category: "Document signing", trustLevel: "official" },
  { domain: "slack.com", service: "Slack", category: "Messaging", trustLevel: "official" },
  { domain: "notion.site", service: "Notion Site", category: "Shared website", trustLevel: "shared-content" },
  { domain: "notion.so", service: "Notion", category: "Productivity", trustLevel: "official" },
  { domain: "canvaslms.com", service: "Canvas", category: "Education", trustLevel: "official" },
  { domain: "instructure.com", service: "Canvas", category: "Education", trustLevel: "official" },
  { domain: "rutgers.edu", service: "Rutgers University", category: "Education", trustLevel: "official" },
  { domain: "scarletmail.rutgers.edu", service: "Rutgers ScarletMail", category: "Education", trustLevel: "official" },
  { domain: "linkedin.com", service: "LinkedIn", category: "Professional network", trustLevel: "official" },
  { domain: "paypal.com", service: "PayPal", category: "Payments", trustLevel: "official" }
];

export const protectedBrandDomains = [
  "zoom.us",
  "adobe.com",
  "amazon.com",
  "apple.com",
  "chase.com",
  "dhl.com",
  "google.com",
  "gmail.com",
  "microsoft.com",
  "office.com",
  "github.com",
  "dropbox.com",
  "docusign.com",
  "slack.com",
  "notion.so",
  "canvaslms.com",
  "instructure.com",
  "rutgers.edu",
  "linkedin.com",
  "netflix.com",
  "paypal.com",
  "fedex.com",
  "ups.com"
];
