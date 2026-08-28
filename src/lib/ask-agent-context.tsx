"use client";

import { createContext, useCallback, useContext, useState } from "react";

type AskAgentContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  // True while the homepage hero's own "Ask SkinWise" button is on screen —
  // lets the floating launcher hide itself so there's never a duplicate.
  heroButtonVisible: boolean;
  setHeroButtonVisible: (visible: boolean) => void;
};

const AskAgentContext = createContext<AskAgentContextValue | null>(null);

export function AskAgentProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [heroButtonVisible, setHeroButtonVisible] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AskAgentContext.Provider
      value={{ isOpen, open, close, heroButtonVisible, setHeroButtonVisible }}
    >
      {children}
    </AskAgentContext.Provider>
  );
}

export function useAskAgent() {
  const ctx = useContext(AskAgentContext);
  if (!ctx) throw new Error("useAskAgent must be used within AskAgentProvider");
  return ctx;
}
