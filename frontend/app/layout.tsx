import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhishGuard",
  description: "Analyze suspicious messages for common phishing indicators."
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
