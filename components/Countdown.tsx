"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  value: number | "smile" | null;
}

export default function Countdown({ value }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {value !== null && (
          <motion.div
            key={String(value)}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex items-center justify-center"
          >
            {value === "smile" ? (
              <span className="font-display font-extrabold text-6xl sm:text-7xl text-feu-gold drop-shadow-[0_0_30px_rgba(255,194,14,0.8)] tracking-wide">
                SMILE!
              </span>
            ) : (
              <span
                className="font-display font-extrabold text-feu-gold drop-shadow-[0_0_40px_rgba(255,194,14,0.85)]"
                style={{ fontSize: "min(40vw, 220px)", lineHeight: 1 }}
              >
                {value}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
