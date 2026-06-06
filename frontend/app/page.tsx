"use client";
import {
  AlertTriangle,
  FileWarning,
  Link2,
  LockKeyhole,
  MailQuestion,
  UserRoundCheck,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CommandCenterShell } from "@/components/dashboard/CommandCenterShell";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { ExampleCard } from "@/components/ExampleCard";
import { LearnCard } from "@/components/LearnCard";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ScannerForm } from "@/components/ScannerForm";
import { saveReport } from "@/lib/reportStorage";
import { sampleMessages } from "@/lib/sampleMessages";
import { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

const learnCards = [
  {
    icon: AlertTriangle,
    title: "Urgency",
    description: "Attackers often create time pressure so users act before thinking or verifying."
  },
  {
    icon: Link2,
    title: "Suspicious Links",
    description: "Shortened links, IP-based links, and login links in unexpected messages deserve extra caution."
  },
  {
    icon: LockKeyhole,
    title: "Credential Requests",
    description: "Legitimate services rarely ask you to submit passwords or codes through message links."
  },
  {
    icon: MailQuestion,
    title: "Spoofed Senders",
    description: "Names can be faked. Always compare sender domains and official contact methods."
  },
  {
    icon: FileWarning,
    title: "Attachments",
    description: "Unexpected attachments can carry malware, especially when they ask you to enable content."
  },
  {
    icon: UserRoundCheck,
    title: "Social Engineering",
    description: "Phishing works by abusing trust, fear, curiosity, or reward signals to shape behavior."
  }
];

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loadedSample, setLoadedSample] = useState<AnalyzeRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const consumeSample = useCallback(() => setLoadedSample(null), []);
  const handleResult = useCallback((nextResult: AnalyzeResponse | null) => {
    setResult(nextResult);
    if (nextResult) {
      saveReport(nextResult);
      setLastScanAt(new Date().toISOString());
    }
  }, []);

  return (
    <>
      <AnimatedBackground />
      <CommandCenterShell lastScanAt={lastScanAt} onLoadHistory={setLoadedSample}>
        <div id="top" className="min-h-screen bg-[#050708]/80">
          <section id="scanner" className="mx-auto w-full max-w-[1800px] scroll-mt-24 px-4 py-5 sm:px-6 lg:px-6 xl:px-8">
            <div className="grid gap-4 xl:grid-cols-[minmax(520px,1fr)_minmax(0,1.25fr)] 2xl:grid-cols-[minmax(600px,1fr)_minmax(0,1.35fr)]">
              <ScannerForm
                onResult={handleResult}
                loadedSample={loadedSample}
                onSampleConsumed={consumeSample}
                onLoadingChange={setLoading}
              />
              <ResultsPanel result={result} loading={loading} />
            </div>
          </section>

          <section id="examples" className="mx-auto w-full max-w-[1800px] scroll-mt-24 px-4 py-6 sm:px-6 lg:px-6 xl:px-8">
            <DashboardPanel title="Demo Message Library">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase text-neutral-500">Examples</p>
                  <h2 className="mt-2 text-3xl font-semibold">Sample messages for demos</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-neutral-400">
                  Load a realistic sample into the scanner to see how each detection rule contributes to the final score.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sampleMessages.map((sample) => (
                  <ExampleCard key={sample.title} sample={sample} onLoad={setLoadedSample} />
                ))}
              </div>
            </DashboardPanel>
          </section>

          <section id="learn" className="mx-auto w-full max-w-[1800px] scroll-mt-24 px-4 py-6 sm:px-6 lg:px-6 xl:px-8">
            <DashboardPanel title="Learn the Warning Signs">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {learnCards.map((card) => (
                  <LearnCard key={card.title} {...card} />
                ))}
              </div>
            </DashboardPanel>
          </section>

          <section id="about" className="mx-auto w-full max-w-[1800px] scroll-mt-24 px-4 py-6 pb-12 sm:px-6 lg:px-6 xl:px-8">
            <DashboardPanel title="About PhishGuard">
              <h2 className="text-2xl font-semibold">A small project for learning phishing detection</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                PhishGuard started as a cybersecurity awareness project to better understand how phishing messages can be broken down into clear rule-based signals.
                Instead of giving a vague warning, it shows the score, the evidence behind that score, and the next steps a user should consider before clicking a link or replying.
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                The goal is not to pretend this replaces a real email security platform. It is a hands-on way to learn how urgency, suspicious links, sender mismatches,
                credential requests, and social engineering language can work together in a phishing attempt.
              </p>
              <p className="mt-4 rounded-md border border-caution/25 bg-caution/10 p-4 text-sm leading-6 text-yellow-100">
                Disclaimer: PhishGuard is an educational tool and should not replace professional cybersecurity software,
                email filtering systems, or expert analysis.
              </p>
            </DashboardPanel>
          </section>

          <footer className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 px-4 pb-8 text-xs text-neutral-500 sm:px-6 lg:px-6 xl:px-8">
            <a
              href="https://shivpatel.net"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-3 text-neutral-400 transition hover:text-white"
            >
              <Image
                src="/shiv-logo.png"
                alt="Shiv Patel logo"
                width={32}
                height={32}
                className="size-8 rounded-lg border border-white/10 bg-black object-cover"
              />
              <span>Built by Shiv Patel</span>
            </a>
            <p>Copyright 2026 Shiv Patel. PhishGuard is an educational cybersecurity awareness project.</p>
          </footer>
        </div>
      </CommandCenterShell>
    </>
  );
}
