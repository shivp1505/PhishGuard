"use client";

import Link from "next/link";
import { MouseEvent, ReactNode, useState } from "react";
import { buildLocalReportHref } from "@/lib/reportStorage";
import { AnalyzeResponse } from "@/lib/types";

export function ReportLink({
  result,
  children,
  className
}: {
  result: AnalyzeResponse;
  children: ReactNode;
  className?: string;
}) {
  const [href, setHref] = useState("/report");

  function prepareHref(event: MouseEvent<HTMLAnchorElement>) {
    const localHref = buildLocalReportHref(result);
    setHref(localHref);

    if (localHref !== href) {
      event.preventDefault();
      window.location.href = localHref;
    }
  }

  return (
    <Link href={href} className={className} onClick={prepareHref}>
      {children}
    </Link>
  );
}
