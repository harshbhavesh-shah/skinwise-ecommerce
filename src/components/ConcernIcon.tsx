const paths: Record<string, React.ReactNode> = {
  Acne: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  Eczema: (
    <path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z" />
  ),
  "Dryness & Hydration": (
    <path d="M12 3c3 4.5 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 9 7.5 12 3z" />
  ),
  "Anti-Aging": (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
  Hyperpigmentation: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="10" cy="11" r="2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="14.5" cy="14" r="1.3" fill="currentColor" stroke="none" opacity="0.6" />
    </>
  ),
  "Sensitive Skin": (
    <path d="M12 21s-7-4.35-9.5-9C.7 8.1 3 4 7 4c2 0 4 1.2 5 3 1-1.8 3-3 5-3 4 0 6.3 4.1 4.5 8-2.5 4.65-9.5 9-9.5 9z" />
  ),
  "Sun Protection": (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  "Hair & Scalp": (
    <path d="M4 6c1.5-2 4-3 8-3s6.5 1 8 3M4 6c0 4 1.5 6 1.5 10.5a2.5 2.5 0 0 0 5 0V13M20 6c0 4-1.5 6-1.5 10.5a2.5 2.5 0 0 1-5 0V13" />
  ),
};

export default function ConcernIcon({ name, className }: { name: string; className?: string }) {
  const path = paths[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}
