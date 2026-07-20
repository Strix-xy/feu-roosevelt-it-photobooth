"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BORDER_STYLE_LIST, BorderStyle } from "@/lib/borders";

const CYCLE_MS = 3800;

function cardRadius(design: BorderStyle["design"]): string {
  switch (design) {
    case "blush-glow":
    case "ocean-wave":
      return "1.75rem";
    case "royal-crest":
      return "0.625rem";
    case "violet-clean":
      return "0.5rem";
    default:
      return "1.5rem";
  }
}

function patternStyle(border: BorderStyle): React.CSSProperties {
  const { design, primary, accent, dotGrid } = border;
  switch (design) {
    case "feu-classic":
      return {
        backgroundImage: `radial-gradient(circle, ${dotGrid} 1.5px, transparent 1.5px)`,
        backgroundSize: "18px 18px",
      };
    case "royal-crest":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${primary}18 0, ${primary}18 1px, transparent 0, transparent 10px), repeating-linear-gradient(-45deg, ${primary}18 0, ${primary}18 1px, transparent 0, transparent 10px)`,
      };
    case "crimson-ornate":
      return {
        backgroundImage: `repeating-linear-gradient(-55deg, ${primary}12, ${primary}12 4px, transparent 4px, transparent 16px)`,
      };
    case "blush-glow":
      return {
        backgroundImage: `radial-gradient(circle, ${primary}28 3px, transparent 3px)`,
        backgroundSize: "22px 22px",
      };
    case "violet-clean":
      return {
        backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      };
    case "ocean-wave":
      return {
        backgroundImage: `radial-gradient(circle at 20% 30%, ${accent}30 0, transparent 8px), radial-gradient(circle at 75% 60%, ${accent}25 0, transparent 10px), radial-gradient(circle at 40% 80%, ${primary}20 0, transparent 6px)`,
      };
    default:
      return {};
  }
}

function CornerAccents({ border }: { border: BorderStyle }) {
  const color = border.accent;
  const opacity = border.design === "violet-clean" ? 0.55 : 0.75;

  if (border.design === "royal-crest") {
    return (
      <>
        {(
          [
            "top-4 left-4 rotate-45 w-2.5 h-2.5",
            "top-4 right-4 rotate-45 w-2.5 h-2.5",
            "bottom-4 left-4 rotate-45 w-2.5 h-2.5",
            "bottom-4 right-4 rotate-45 w-2.5 h-2.5",
          ] as const
        ).map((cls) => (
          <motion.span
            key={cls}
            className={`absolute ${cls}`}
            style={{ backgroundColor: color, opacity }}
            layout
          />
        ))}
      </>
    );
  }

  if (border.design === "blush-glow") {
    return (
      <>
        <motion.span
          className="absolute top-5 right-6 w-2 h-2 rounded-full"
          style={{ backgroundColor: color, opacity: 0.9 }}
        />
        <motion.span
          className="absolute top-9 right-10 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, opacity: 0.6 }}
        />
        <motion.span
          className="absolute bottom-6 left-7 w-2 h-2 rounded-full"
          style={{ backgroundColor: color, opacity: 0.7 }}
        />
      </>
    );
  }

  return (
    <>
      <span
        className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 rounded-tl"
        style={{ borderColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}` }}
      />
      <span
        className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 rounded-tr"
        style={{ borderColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}` }}
      />
      <span
        className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 rounded-bl"
        style={{ borderColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}` }}
      />
      <span
        className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 rounded-br"
        style={{ borderColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}` }}
      />
    </>
  );
}

export default function StartWelcomeCard() {
  const [index, setIndex] = useState(0);
  const border = BORDER_STYLE_LIST[index];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BORDER_STYLE_LIST.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="relative w-full border-2 flex flex-col items-center gap-5 p-8 overflow-hidden shadow-panel"
      animate={{
        backgroundColor: border.primaryDark,
        borderColor: `${border.accent}55`,
        borderRadius: cardRadius(border.design),
      }}
      transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={border.id}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={patternStyle(border)}
        />
      </AnimatePresence>

      {border.design === "blush-glow" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ boxShadow: `inset 0 0 60px ${border.accent}22` }}
          transition={{ duration: 0.85 }}
        />
      )}

      <CornerAccents border={border} />

      <motion.div
        className="relative w-20 h-20 rounded-full flex items-center justify-center mt-2 shadow-lg"
        animate={{ backgroundColor: border.accent }}
        transition={{ duration: 0.85 }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
            stroke={border.primaryDark}
            strokeWidth="1.8"
          />
          <circle cx="12" cy="13" r="3.4" stroke={border.primaryDark} strokeWidth="1.8" />
        </svg>
      </motion.div>

      <div className="relative flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-9 h-12 rounded-md border-2"
            animate={{
              borderColor: `${border.accent}99`,
              backgroundColor: `${border.cream}18`,
            }}
            transition={{ duration: 0.85 }}
          />
        ))}
      </div>

      <p className="relative text-feu-cream/90 font-body text-base leading-relaxed">
        Pick a layout and border, strike a pose — we&apos;ll count you in and
        capture your shots automatically. Scan the QR code afterward to send it
        straight to your phone.
      </p>

      <motion.p
        className="relative font-mono text-[10px] tracking-widest uppercase"
        animate={{ color: `${border.accent}99` }}
        transition={{ duration: 0.85 }}
      >
        ACES · Alliance of Computing Education Students
      </motion.p>
    </motion.div>
  );
}
