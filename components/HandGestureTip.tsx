"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  /** Show tip when true (e.g. camera stage ready to capture) */
  active: boolean;
  /** How long the tip stays visible */
  durationMs?: number;
}

function FistIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 11.5V9.2a1.2 1.2 0 0 1 2.4 0V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.5 11V8.4a1.2 1.2 0 0 1 2.4 0V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13 11V8.8a1.2 1.2 0 0 1 2.4 0V11.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15.5 11.5v-.6a1.2 1.2 0 0 1 2.4 0V13a4.8 4.8 0 0 1-4.8 4.8H12A5 5 0 0 1 7 12.8v-1.6a1.2 1.2 0 0 1 2.4 0V11.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Knuckle bar — reads as a closed fist */}
      <path
        d="M8.2 11.2h8.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OpenPalmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M8.5 11V6.5a1.5 1.5 0 0 1 3 0V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M11.5 10.5V4.75a1.5 1.5 0 0 1 3 0V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14.5 10.5V5.5a1.5 1.5 0 0 1 3 0V12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M17.5 12v-1.25a1.5 1.5 0 0 1 3 0V14a6.5 6.5 0 0 1-6.5 6.5h-1.2A6.8 6.8 0 0 1 6 13.7V9.5a1.5 1.5 0 0 1 3 0V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Brief onboarding toast — closed → open gesture, then hides.
 */
export default function HandGestureTip({
  active,
  durationMs = 6000,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [showOpen, setShowOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setShowOpen(false);
      return;
    }

    setVisible(true);
    setShowOpen(false);
    const hide = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(hide);
  }, [active, durationMs]);

  // Swap closed ↔ open icons while the tip is up
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setShowOpen((v) => !v), 900);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none absolute inset-x-3 top-14 z-20 flex justify-center"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-feu-greenDark/90 border border-feu-gold/40 px-4 py-3 shadow-panel backdrop-blur-md max-w-[min(100%,22rem)]">
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                  !showOpen
                    ? "bg-feu-gold text-feu-greenDark scale-105 shadow-gold-soft"
                    : "bg-feu-cream/10 text-feu-cream/45 scale-95"
                }`}
              >
                <FistIcon />
              </span>
              <span
                className="font-mono text-feu-gold/70 text-sm"
                aria-hidden
              >
                →
              </span>
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                  showOpen
                    ? "bg-feu-gold text-feu-greenDark scale-105 shadow-gold-soft"
                    : "bg-feu-cream/10 text-feu-cream/45 scale-95"
                }`}
              >
                <OpenPalmIcon />
              </span>
            </div>
            <div className="text-left min-w-0">
              <p className="font-display font-bold text-feu-cream text-sm leading-snug">
                Close, then open your hand
              </p>
              <p className="font-body text-feu-cream/65 text-xs leading-snug mt-0.5">
                Make a fist toward the camera, then open your palm to start
                capturing — or tap the button.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
