"use client";

export default function AskCtaButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Ask SkinWise for product recommendations"
      className={`group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.3)] ${className}`}
    >
      {/* Fill sweep — scales in from the left on hover, clipped by the
          button's own rounded corners + overflow-hidden. */}
      <span
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100"
      />
      <span className="relative z-10 flex items-center gap-2 text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-5 w-5 shrink-0"
        >
          <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
          <path d="M19 14l.8 1.9L21.7 16.7 19.8 17.5 19 19.4 18.2 17.5 16.3 16.7 18.2 15.9 19 14z" />
        </svg>
        Ask SkinWise
      </span>
    </button>
  );
}
