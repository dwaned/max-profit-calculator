const ICON_PATHS = {
  conversation: (
    <>
      <path d="M4 5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-4-3h-3" />
    </>
  ),
  dice: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
    </>
  ),
  mutant: (
    <>
      <path d="M8 3c0 6 8 6 8 12s-8 6-8 6" />
      <path d="M16 3c0 6-8 6-8 12" />
      <path d="M9 7h6M9 17h6" />
    </>
  ),
  gauge: (
    <>
      <path d="M3 17a9 9 0 1 1 18 0" />
      <path d="M12 17 8 11" />
      <path d="M7 21h10" />
    </>
  ),
  'gauge-fast': (
    <>
      <path d="M3 17a9 9 0 1 1 18 0" />
      <path d="M12 17l5-6" />
      <path d="M7 21h10" />
    </>
  ),
  check: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  spark: (
    <>
      <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" />
    </>
  ),
  handshake: (
    <>
      <path d="M4 7h4l4 3 4-3h4" />
      <path d="M2 7v8l6 5 4-3 4 3 6-5V7" />
      <path d="m9 14 3 2 3-2" />
    </>
  ),
  browser: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 9h20" />
      <circle cx="5.5" cy="6.5" r=".6" fill="currentColor" />
      <circle cx="8" cy="6.5" r=".6" fill="currentColor" />
      <path d="m10 13 3 2-3 2" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

/** Small line icons shared by the technique cards on both testing pages. */
export default function TechniqueIcon({ name, className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
