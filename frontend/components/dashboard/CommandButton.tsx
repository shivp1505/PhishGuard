import { ComponentPropsWithoutRef } from "react";

type CommandButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants = {
  primary:
    "border-[#8d84e8]/80 bg-[linear-gradient(180deg,#8d84e8,#5F57B8)] text-white shadow-[0_0_18px_rgba(141,132,232,0.26)] hover:brightness-110",
  secondary: "border-white/15 bg-[#0A0F12] text-[#F4F7F5] hover:border-white/25 hover:bg-[#131B20]",
  danger: "border-red-500/70 bg-red-500/10 text-red-300 hover:bg-red-500/15",
  ghost: "border-transparent bg-transparent text-[#A8B3AD] hover:bg-white/[0.06] hover:text-white"
};

export function commandButtonClassName(variant: keyof typeof variants = "primary", className = "") {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold uppercase tracking-wide outline-none transition focus-visible:border-[#8d84e8]/70 focus-visible:ring-2 focus-visible:ring-[#8d84e8]/20 disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`;
}

export function CommandButton({ variant = "primary", className = "", ...props }: CommandButtonProps) {
  return <button className={commandButtonClassName(variant, className)} {...props} />;
}
