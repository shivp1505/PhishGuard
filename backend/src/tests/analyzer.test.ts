import assert from "node:assert/strict";
import { getRootDomain } from "../services/domainIntelligence";
import { analyzeMessage } from "../services/phishingAnalyzer";

function test(name: string, run: () => void) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("safe Zoom link stays low risk and trims trailing punctuation", () => {
  const result = analyzeMessage({
    sender: "professor@rutgers.edu",
    subject: "Class meeting",
    message: "Here is the Zoom link: https://rutgers.zoom.us/j/123456789. See you there.",
    url: ""
  });

  assert.equal(result.riskScore, 0);
  assert.equal(result.riskLevel, "Low");
  assert.equal(result.evidenceStrength, "Context only");
  assert.ok(result.indicators.some((indicator) => indicator.type === "Known Service Link"));
  assert.ok(result.indicators[0].matches.every((match) => !match.includes("789.")));
});

test("subject-only security wording is weak evidence", () => {
  const result = analyzeMessage({
    sender: "sp2392@scarletmail.rutgers.edu",
    subject: "Security check required",
    message: "Hello",
    url: ""
  });

  assert.equal(result.riskScore, 5);
  assert.equal(result.riskLevel, "Low");
  assert.ok(result.indicators.some((indicator) => indicator.type === "Weak Subject Signal"));
});

test("Zoom lookalike with pressure scores critical", () => {
  const result = analyzeMessage({
    sender: "security@z00m-login.com",
    subject: "Urgent Zoom security check",
    message:
      "Dear user, verify your account immediately at http://z00m-login.com/account/login or your account will be suspended.",
    url: ""
  });

  assert.equal(result.riskLevel, "Critical");
  assert.ok(result.riskScore >= 75);
  assert.ok(result.indicators.some((indicator) => indicator.type === "Suspicious Link"));
});

test("shortened login link is suspicious", () => {
  const result = analyzeMessage({
    sender: "security@example.com",
    subject: "Account alert",
    message: "Please login now at http://bit.ly/secure-reset to verify your account.",
    url: ""
  });

  assert.ok(result.riskScore >= 40);
  assert.ok(result.indicators.some((indicator) => indicator.type === "Suspicious Link"));
});

test("trusted links do not hide suspicious message context", () => {
  const result = analyzeMessage({
    sender: "support@example.com",
    subject: "Urgent password verification",
    message: "Verify your password immediately using this meeting link: https://zoom.us/j/123456789",
    url: ""
  });

  assert.equal(result.riskScore, 35);
  assert.equal(result.riskLevel, "Medium");
  assert.ok(result.indicators.some((indicator) => indicator.type === "Known Service Link"));
  assert.ok(
    result.indicators.some(
      (indicator) =>
        indicator.type === "Known Service Link" && indicator.metadata?.domainVerdict === "known-service-with-risk-context"
    )
  );
  assert.ok(result.indicators.some((indicator) => indicator.type === "Credential Request"));
  assert.ok(!result.indicators.some((indicator) => indicator.type === "Suspicious Link"));
});

test("shared-content links add review context even on legitimate platforms", () => {
  const result = analyzeMessage({
    sender: "student@example.com",
    subject: "Survey",
    message: "Please complete this form before class: https://forms.gle/exampleSurvey",
    url: ""
  });

  assert.equal(result.riskScore, 8);
  assert.equal(result.riskLevel, "Low");
  assert.ok(result.summary.includes("shared-content link"));
  assert.ok(result.indicators.some((indicator) => indicator.type === "Shared Content Link"));
  assert.ok(
    result.indicators.some(
      (indicator) => indicator.type === "Shared Content Link" && indicator.metadata?.domainVerdict === "shared-content"
    )
  );
});

test("shared-content links escalate when paired with credential or payment context", () => {
  const result = analyzeMessage({
    sender: "forms@example.com",
    subject: "Payment verification",
    message: "Verify your account and update payment using this form: https://forms.gle/payPortal",
    url: ""
  });

  const sharedContent = result.indicators.find((indicator) => indicator.type === "Shared Content Link");
  assert.ok(sharedContent);
  assert.equal(sharedContent.metadata?.domainVerdict, "shared-content-with-risk-context");
  assert.ok(sharedContent.score >= 14);
  assert.ok(result.riskLevel === "Medium" || result.riskLevel === "High" || result.riskLevel === "Critical");
});

test("risky attachment filenames are detected as attachment evidence", () => {
  const result = analyzeMessage({
    sender: "billing@example.com",
    subject: "Invoice attached",
    message: "Please review invoice_update.xlsm before end of day.",
    url: ""
  });

  assert.ok(result.indicators.some((indicator) => indicator.type === "Risky Attachment Name"));
  assert.ok(result.riskScore >= 18);
});

test("multiple different destination domains are stronger than repeated same-domain links", () => {
  const result = analyzeMessage({
    sender: "alerts@example.com",
    subject: "Account review",
    message: "Start at https://example-login.com/login then confirm at https://another-example.net/verify.",
    url: ""
  });

  assert.ok(
    result.indicators.some((indicator) =>
      indicator.matches.some((match) => match.includes("Multiple different link domains"))
    )
  );
});

test("expanded brand sender mismatch detects Apple display name from unrelated domain", () => {
  const result = analyzeMessage({
    sender: "Apple Support <security@gmail.com>",
    subject: "Account notice",
    message: "Hello, please review your account settings.",
    url: ""
  });

  assert.ok(result.indicators.some((indicator) => indicator.type === "Sender Identity Mismatch"));
});

test("multi-part public suffix domains are grouped correctly", () => {
  assert.equal(getRootDomain("login.service.example.co.uk"), "example.co.uk");
  assert.equal(getRootDomain("www.portal.university.ac.uk"), "university.ac.uk");
});

test("generic login-looking domains are not treated as Microsoft lookalikes", () => {
  const result = analyzeMessage({
    sender: "updates@example.com",
    subject: "Portal",
    message: "Review the portal at https://login-example.com/dashboard",
    url: ""
  });

  assert.ok(!result.indicators.some((indicator) => indicator.matches.some((match) => match.includes("microsoftonline.com"))));
});

test("writing quality warning detects suspicious typos and pressure punctuation", () => {
  const result = analyzeMessage({
    sender: "notice@example.com",
    subject: "Account notice",
    message: "Kindly verifiy your acc0unt immediatly!!! Failure to respond may restrict access.",
    url: ""
  });

  assert.ok(result.indicators.some((indicator) => indicator.type === "Writing Quality Warning"));
  assert.ok(result.riskScore >= 10);
});

test("sender identity mismatch detects brand name with unrelated sender domain", () => {
  const result = analyzeMessage({
    sender: "PayPal Support <billing-alerts@gmail.com>",
    subject: "Payment issue",
    message: "Your payment failed. Please review your account.",
    url: ""
  });

  assert.ok(result.indicators.some((indicator) => indicator.type === "Sender Identity Mismatch"));
});

test("link text mismatch detects visible and actual destination mismatch", () => {
  const result = analyzeMessage({
    sender: "events@example.com",
    subject: "Meeting link",
    message: "Join at [zoom.us](https://evil-example.com/login) before the session starts.",
    url: ""
  });

  assert.ok(result.indicators.some((indicator) => indicator.type === "Link Text Mismatch"));
  assert.ok(result.riskScore >= 20);
});
