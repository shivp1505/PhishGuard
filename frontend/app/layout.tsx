import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhishGuard",
  description: "Analyze suspicious messages for phishing indicators with a rule-based awareness scanner.",
  metadataBase: new URL("https://phishguard.shivpatel.net"),
  openGraph: {
    title: "PhishGuard",
    description: "Analyze suspicious messages for phishing indicators with a rule-based awareness scanner.",
    url: "https://phishguard.shivpatel.net",
    siteName: "PhishGuard",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "PhishGuard",
    description: "Analyze suspicious messages for phishing indicators with a rule-based awareness scanner."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
