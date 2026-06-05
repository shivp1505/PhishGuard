"use client";

import { LucideIcon } from "lucide-react";
import { useState } from "react";

export function LearnCard({
  icon: Icon,
  title,
  description
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <article
      className="group relative grid min-h-48 cursor-pointer place-items-center overflow-hidden rounded-md border border-white/10 bg-[#11171B] p-6 text-center transition-colors duration-200 hover:bg-[#131B20]"
      onClick={() => setActive((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setActive((value) => !value);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={active}
      aria-label={`${title}: ${description}`}
    >
      <div
        className={`grid justify-items-center transition-all duration-300 ${
          active ? "translate-y-[-18px] opacity-0" : "group-hover:translate-y-[-18px] group-hover:opacity-0"
        }`}
      >
        <span className="grid size-14 place-items-center rounded-md border border-white/10 bg-[#0A0F12] text-[#8d84e8]">
          <Icon size={24} />
        </span>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      </div>
      <p
        className={`absolute inset-x-5 top-1/2 -translate-y-1/2 text-sm leading-6 text-neutral-300 transition-all duration-300 ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {description}
      </p>
    </article>
  );
}
