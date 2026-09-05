// A row of 5 stars supporting half-star fills via clip-path, matching the
// site's stroked-SVG icon style rather than dropping in star emoji.
function Star({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block h-[15px] w-[15px]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="absolute inset-0 h-full w-full text-ink-soft/40">
        <path d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
      </svg>
      {fill > 0 && (
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px] text-accent">
            <path d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
          </svg>
        </span>
      )}
    </span>
  );
}

export default function StarRating({ value, className = "" }: { value: number; className?: string }) {
  const stars = Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, value - i)));
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars.map((fill, i) => (
        <Star key={i} fill={fill} />
      ))}
    </span>
  );
}
