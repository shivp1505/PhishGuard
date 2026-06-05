import { DetectionRule } from "../types/analysis";

export const keywordRules: DetectionRule[] = [
  {
    type: "Urgency",
    severity: "Medium",
    score: 15,
    description: "The message uses time pressure to push the reader into acting quickly.",
    patterns: [
      /\burgent\b/i,
      /\bimmediately\b/i,
      /\bact now\b/i,
      /\bfinal warning\b/i,
      /\baccount locked\b/i,
      /\blimited time\b/i,
      /\bexpires today\b/i,
      /\bwithin 24 hours\b/i
    ]
  },
  {
    type: "Credential Request",
    severity: "High",
    score: 20,
    description: "The message asks for sign-in, password, identity, or account verification actions.",
    patterns: [
      /\bpassword\b/i,
      /\bverify your account\b/i,
      /\blogin\b/i,
      /\blog in\b/i,
      /\bsign in\b/i,
      /\bconfirm your identity\b/i,
      /\bsecurity check\b/i,
      /\bupdate payment\b/i
    ]
  },
  {
    type: "Financial Pressure",
    severity: "Medium",
    score: 15,
    description: "The message references money, payments, invoices, refunds, or billing pressure.",
    patterns: [
      /\bbank\b/i,
      /\bpayment\b/i,
      /\binvoice\b/i,
      /\brefund\b/i,
      /\bwire transfer\b/i,
      /\bcredit card\b/i,
      /\bbilling\b/i,
      /\btransaction failed\b/i
    ]
  },
  {
    type: "Social Engineering",
    severity: "High",
    score: 15,
    description: "The message uses fear, reward, or account safety language to manipulate the reader.",
    patterns: [
      /\byour account will be suspended\b/i,
      /\bunusual activity\b/i,
      /\bsecurity alert\b/i,
      /\bclaim your reward\b/i,
      /\byou have won\b/i,
      /\bverify now\b/i,
      /\bfailure to respond\b/i
    ]
  },
  {
    type: "Generic Greeting",
    severity: "Low",
    score: 10,
    description: "The message uses a generic greeting instead of identifying the recipient personally.",
    patterns: [
      /\bdear user\b/i,
      /\bdear customer\b/i,
      /\bhello account holder\b/i,
      /\bvalued customer\b/i
    ]
  },
  {
    type: "Attachment Warning",
    severity: "High",
    score: 20,
    description: "The message encourages opening or downloading attachments, which is a common malware delivery path.",
    patterns: [
      /\bopen attachment\b/i,
      /\bdownload file\b/i,
      /\battached invoice\b/i,
      /\bmacro\b/i,
      /\benable content\b/i
    ]
  },
  {
    type: "Too Good To Be True",
    severity: "Medium",
    score: 15,
    description: "The message promises rewards or prizes that may be used as bait.",
    patterns: [
      /\bfree gift\b/i,
      /\bexclusive reward\b/i,
      /\bprize\b/i,
      /\bwinner\b/i,
      /\bclaim now\b/i
    ]
  }
];

export const shortenedUrlDomains = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd"];
