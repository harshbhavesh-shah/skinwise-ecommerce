"use client";

import { useAskAgent } from "@/lib/ask-agent-context";
import AskCtaButton from "./AskCtaButton";

export default function FloatingAskButton() {
  const { open, isOpen, heroButtonVisible } = useAskAgent();
  const visible = !isOpen && !heroButtonVisible;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[95] transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <AskCtaButton onClick={open} />
    </div>
  );
}
