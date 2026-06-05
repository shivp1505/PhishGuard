export function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8d84e8]/30 to-transparent" />
      <div className="absolute right-0 top-20 h-[38rem] w-px bg-gradient-to-b from-[#8d84e8]/20 via-white/10 to-transparent" />
    </div>
  );
}
