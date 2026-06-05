type PhishGuardMarkProps = {
  className?: string;
  compact?: boolean;
  animate?: boolean;
};

const hookPath =
  "M169.642,229.816h36.515c-5.058,26-28.037,46.125-55.341,46.125c-31.107,0-56.374-25.521-56.374-56.629V116.156c3-2.903,5-7.293,5-12.206V15.828C99.441,7.086,92.683,0,83.941,0s-15.5,7.086-15.5,15.828v88.122c0,4.913,2,9.303,5,12.206v103.156c0,42.221,34.731,76.569,76.952,76.569c41.719,0,76.304-34.296,76.804-76.496c0.002-0.331,0.244-38.913,0.244-39.301v-31.431L169.642,229.816z";

export function PhishGuardMark({ className = "", compact = false, animate = false }: PhishGuardMarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${animate ? "phishguard-mark-animated" : ""} ${className}`} aria-label="PhishGuard">
      <span className="relative grid size-12 shrink-0 place-items-center text-[#8d84e8]">
        <svg viewBox="0 0 64 72" role="img" aria-hidden="true" className="h-full w-full">
          <path
            className="phishguard-shield"
            d="M32 4 55 13v19c0 16.5-9.8 29.6-23 35.5C18.8 61.6 9 48.5 9 32V13L32 4Z"
            fill="rgba(141,132,232,0.10)"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <g transform="translate(52 15.4) scale(-0.135 0.135)">
            <g className="phishguard-hook">
              <path d={hookPath} fill="currentColor" />
            </g>
          </g>
        </svg>
      </span>
      {!compact && (
        <span className="text-2xl font-bold tracking-tight text-[#F4F7F5]">
          Phish<span className="text-[#8d84e8]">Guard</span>
        </span>
      )}
    </span>
  );
}
