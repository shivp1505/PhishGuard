import { AnalyzeRequest, RiskLevel } from "./types";

export interface SampleMessage {
  title: string;
  description: string;
  risk: RiskLevel;
  scenario: string;
  expectedOutcome: string;
  payload: AnalyzeRequest;
}

export const sampleMessages: SampleMessage[] = [
  {
    title: "Fake Password Reset",
    description: "Claims your account will be locked unless you reset your password immediately.",
    risk: "Critical",
    scenario: "Critical credential theft",
    expectedOutcome: "Critical risk: urgency, credential request, social engineering, generic greeting, suspicious link, sender mismatch",
    payload: {
      sender: "security@paypa1-alerts.com",
      subject: "Final warning: account locked within 24 hours",
      message:
        "Dear customer, unusual activity was detected. Verify your account immediately or your account will be suspended. Login at http://bit.ly/secure-reset to confirm your identity.",
      url: "http://bit.ly/secure-reset"
    }
  },
  {
    title: "Package Delivery Text",
    description: "Uses a delivery problem and time pressure, but does not include a link or credential request.",
    risk: "Medium",
    scenario: "Medium-risk delivery pressure",
    expectedOutcome: "Moderate evidence: payment wording and limited-time pressure",
    payload: {
      sender: "Delivery Notice",
      subject: "Package held",
      message:
        "Your package has a payment issue and limited time remaining before it is returned. Review the notice from the carrier before taking action."
    }
  },
  {
    title: "Bank Alert",
    description: "Pretends to be a bank security warning and asks for verification.",
    risk: "Critical",
    scenario: "Critical banking phishing",
    expectedOutcome: "Strong evidence: account pressure, IP URL, credential request",
    payload: {
      sender: "alerts@bank-example.com",
      subject: "Security alert: transaction failed",
      message:
        "Dear user, failure to respond will restrict your online banking access. Verify now at https://192.168.10.45/account/login and update payment details."
    }
  },
  {
    title: "Fake Job Offer",
    description: "Promises priority access and asks the user to download instructions.",
    risk: "Medium",
    scenario: "Medium-risk reward bait",
    expectedOutcome: "Moderate evidence: reward language and attachment request",
    payload: {
      sender: "jobs@career-fast.example",
      subject: "Prize interview notice",
      message:
        "Congratulations, you have won priority access to a remote interview slot. Download file instructions before the review window closes."
    }
  },
  {
    title: "University Account Warning",
    description: "Uses school account pressure and a generic greeting.",
    risk: "High",
    scenario: "Account suspension pressure",
    expectedOutcome: "Strong evidence: urgency, credential request, generic greeting",
    payload: {
      sender: "it-helpdesk@university.example",
      subject: "Security check required",
      message:
        "Hello account holder, your account will be suspended unless you complete this security check within 24 hours. Sign in and confirm your identity."
    }
  },
  {
    title: "Normal Team Update",
    description: "A low-risk meeting reminder with no pressure, links, or credential request.",
    risk: "Low",
    scenario: "Benign workplace message",
    expectedOutcome: "Low evidence: no clear phishing indicators",
    payload: {
      sender: "morgan@company.example",
      subject: "Thursday project sync",
      message:
        "Hi Shiv, sharing a reminder that our project sync is Thursday at 2 PM. No action needed before then. I will send notes afterward."
    }
  }
];

export const scannerSamplePool: SampleMessage[] = [
  ...sampleMessages,
  {
    title: "DocuSign Review",
    description: "Uses a real document-signing brand with a shared-content style request.",
    risk: "Medium",
    scenario: "Shared document review",
    expectedOutcome: "Medium risk: known brand context with action pressure",
    payload: {
      sender: "contracts@vendor-updates.example",
      subject: "Document waiting for review",
      message:
        "Please review the attached agreement today. The request expires today and requires your confirmation before the end of business.",
      url: "https://docusign.net/review/example"
    }
  },
  {
    title: "Teams Meeting Invite",
    description: "A low-risk meeting message using a known Microsoft Teams link.",
    risk: "Low",
    scenario: "Legitimate meeting context",
    expectedOutcome: "Low risk: known service link with normal wording",
    payload: {
      sender: "alex@company.example",
      subject: "Teams link for planning call",
      message:
        "Hi team, here is the Teams link for tomorrow's planning call. No prep needed, just bring any blockers you want to discuss.",
      url: "https://teams.microsoft.com/l/meetup-join/example"
    }
  },
  {
    title: "Shared Google Form",
    description: "A shared form link with a request for personal information.",
    risk: "High",
    scenario: "Hosted form collection",
    expectedOutcome: "High risk: shared-content link with credential or identity context",
    payload: {
      sender: "student-services@campus-update.example",
      subject: "Student verification form",
      message:
        "Hello account holder, complete this verification form within 24 hours to avoid interruption. Confirm your identity and sign in details before access is restricted.",
      url: "https://forms.gle/example"
    }
  },
  {
    title: "Payroll Update",
    description: "Pretends to be HR and pressures the user to update payment details.",
    risk: "Critical",
    scenario: "Payroll impersonation",
    expectedOutcome: "Critical risk: financial pressure, credentials, urgency, and sender mismatch",
    payload: {
      sender: "HR Payroll <payroll@company-benefits.example>",
      subject: "Payroll deposit failed",
      message:
        "Dear employee, your payroll deposit failed. Update payment and bank information immediately at http://company-benefits.example/payroll/login or your next payment may be delayed."
    }
  }
];
