"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BorderStyleId, BORDER_STYLE_LIST } from "@/lib/borders";
import { renderBorderPreview } from "@/lib/capture";

interface Props {
  selectedId: BorderStyleId;
  onSelect: (id: BorderStyleId) => void;
}

export default function BorderCarousel({ selectedId, onSelect }: Props) {
  const [index, setIndex] = useState(() =>
    Math.max(0, BORDER_STYLE_LIST.findIndex((b) => b.id === selectedId))
  );
  const [direction, setDirection] = useState(0);

  const previews = useMemo(() => {
    const map = new Map<BorderStyleId, string>();
    for (const border of BORDER_STYLE_LIST) {
      map.set(border.id, renderBorderPreview(border));
    }
    return map;
  }, []);

  const current = BORDER_STYLE_LIST[index];

  useEffect(() => {
    const idx = BORDER_STYLE_LIST.findIndex((b) => b.id === selectedId);
    if (idx >= 0 && idx !== index) setIndex(idx);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  function goTo(next: number) {
    const len = BORDER_STYLE_LIST.length;
    const wrapped = ((next % len) + len) % len;
    setDirection(wrapped > index || (index === len - 1 && wrapped === 0) ? 1 : -1);
    setIndex(wrapped);
    onSelect(BORDER_STYLE_LIST[wrapped].id);
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.96 }),
  };

  return (
    <motion.div className="flex flex-col items-center gap-5 sm:gap-6 w-full">
      {/* Full-size strip preview */}
      <div className="relative w-full flex items-center justify-center px-2 sm:px-4">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous border design"
          className="absolute left-0 sm:left-2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-feu-green/20 bg-white/95 backdrop-blur-sm hover:border-feu-gold hover:bg-feu-cream flex items-center justify-center transition-all active:scale-95 shadow-panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-feu-greenDark"
            />
          </svg>
        </button>

        <motion.div
          className="relative flex items-center justify-center w-full py-2"
          style={{ minHeight: "min(80vh, 780px)" }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.button
              key={current.id}
              type="button"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(current.id)}
              className={`relative rounded-2xl overflow-hidden transition-shadow duration-300 ${
                selectedId === current.id
                  ? "ring-4 ring-feu-gold shadow-gold"
                  : "ring-2 ring-feu-green/15 shadow-panel hover:ring-feu-gold/50"
              }`}
            >
              <img
                src={previews.get(current.id)}
                alt={`${current.label} border preview`}
                className="block h-auto w-auto select-none"
                style={{
                  maxHeight: "min(80vh, 780px)",
                  maxWidth: "min(94vw, 28rem)",
                }}
                draggable={false}
              />
              {selectedId === current.id && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-feu-gold text-feu-greenDark text-xs font-mono font-bold tracking-wider uppercase shadow-sm"
                >
                  Selected
                </motion.span>
              )}
            </motion.button>
          </AnimatePresence>
        </motion.div>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next border design"
          className="absolute right-0 sm:right-2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-feu-green/20 bg-white/95 backdrop-blur-sm hover:border-feu-gold hover:bg-feu-cream flex items-center justify-center transition-all active:scale-95 shadow-panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-feu-greenDark"
            />
          </svg>
        </button>
      </div>

      {/* Label + counter */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="text-center space-y-2 px-4"
      >
        <p className="font-mono text-[11px] tracking-widest text-feu-green/60 uppercase">
          {index + 1} of {BORDER_STYLE_LIST.length}
        </p>
        <p className="font-display font-bold text-2xl text-feu-greenDark">{current.label}</p>
        <p className="font-body text-sm sm:text-base text-feu-ink/60 max-w-md mx-auto leading-relaxed">
          {current.description}
        </p>
      </motion.div>

      {/* Dot navigation */}
      <motion.div className="flex items-center gap-2 flex-wrap justify-center px-4">
        {BORDER_STYLE_LIST.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Go to ${b.label}`}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? "w-7 h-2.5 bg-feu-gold"
                : "w-2.5 h-2.5 bg-feu-green/25 hover:bg-feu-green/40"
            }`}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
