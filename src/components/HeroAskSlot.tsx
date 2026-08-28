"use client";

import { useEffect, useRef } from "react";
import { useAskAgent } from "@/lib/ask-agent-context";
import AskCtaButton from "./AskCtaButton";

// Lives inside the homepage hero. While this button is on screen, the
// floating bottom-right launcher hides itself — as soon as this scrolls
// out of view (or the user leaves the homepage, since this unmounts), the
// floating button takes over.
export default function HeroAskSlot() {
  const { open, setHeroButtonVisible } = useAskAgent();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroButtonVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setHeroButtonVisible(false);
    };
  }, [setHeroButtonVisible]);

  return (
    <div ref={sentinelRef} className="inline-block">
      <AskCtaButton onClick={open} className="px-7 py-4 text-[15px]" />
    </div>
  );
}
