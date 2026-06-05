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
