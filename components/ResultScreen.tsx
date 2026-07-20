"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import QRCodeDisplay from "./QRCodeDisplay";
import { BorderStyle } from "@/lib/borders";
import { TemplateConfig } from "@/lib/types";
import { composeStrip } from "@/lib/capture";

interface Props {
  stripUrl: string;
  shots: string[];
  template: TemplateConfig;
  border: BorderStyle;
  footerText: string;
  onFooterChange: (text: string) => void;
  onStripUpdate: (url: string) => void;
  onNewSession: () => void;
}

export default function ResultScreen({
  stripUrl,
  shots,
  template,
  border,
  footerText,
  onFooterChange,
  onStripUpdate,
  onNewSession,
}: Props) {
  const [recomposing, setRecomposing] = useState(false);
  const skipInitial = useRef(true);

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setRecomposing(true);
      try {
        const url = await composeStrip(shots, template, { border, footerText });
        if (!cancelled) onStripUpdate(url);
      } finally {
        if (!cancelled) setRecomposing(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [footerText, shots, template, border, onStripUpdate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 w-full max-w-6xl py-4"
    >
      <div className="shrink-0 animate-pop-in flex items-center justify-center relative">
        <img
          src={stripUrl}
          alt="Your photostrip"
          className="rounded-2xl shadow-panel transition-opacity duration-300"
          style={{
            maxWidth: "min(92vw, 46rem)",
            maxHeight: "86vh",
            width: "auto",
            height: "auto",
            opacity: recomposing ? 0.7 : 1,
          }}
        />
        {recomposing && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-feu-greenDark/80 text-feu-cream text-xs font-mono">
            Updating…
          </span>
        )}
      </div>

      <div className="flex-1 w-full max-w-md lg:max-w-lg flex flex-col items-center gap-7 bg-feu-greenDark rounded-3xl p-8 sm:p-10 shadow-panel border border-feu-gold/20">
        <div className="text-center">
          <h2 className="font-display font-extrabold text-3xl text-feu-cream">
            Looking good!
          </h2>
          <p className="text-feu-cream/70 text-base mt-2 font-body leading-relaxed">
            Customise your footer, then download or scan the QR code.
          </p>
        </div>

        <div className="w-full space-y-2">
          <label
            htmlFor="footer-tagline"
            className="block font-mono text-[10px] tracking-widest text-feu-gold/70 uppercase"
          >
            Footer tagline
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-feu-green text-sm select-none">
              &gt;
            </span>
            <input
              id="footer-tagline"
              type="text"
              value={footerText}
              onChange={(e) => onFooterChange(e.target.value)}
              maxLength={80}
              placeholder='git commit -m "Your message"'
              className="w-full pl-7 pr-4 py-3 rounded-xl bg-feu-cream/95 text-feu-greenDark font-mono text-sm border-2 border-transparent focus:border-feu-gold focus:outline-none transition-colors"
            />
          </div>
          <p className="font-body text-xs text-feu-cream/50">
            This appears at the bottom of your strip — make it yours before downloading.
          </p>
        </div>

        <QRCodeDisplay imageDataUrl={stripUrl} />

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href={stripUrl}
            download={`feu-roosevelt-it-photobooth-${Date.now()}.png`}
            className="text-center flex-1 px-6 py-4 rounded-xl bg-feu-gold text-feu-greenDark font-display font-bold text-base shadow-gold hover:brightness-105 active:scale-95 transition-all"
          >
            Download on this device
          </a>
          <button
            onClick={onNewSession}
            className="flex-1 px-6 py-4 rounded-xl border border-feu-gold/50 text-feu-gold font-display font-semibold text-base hover:bg-feu-gold/10 active:scale-95 transition-all"
          >
            New Session
          </button>
        </div>
      </div>
    </motion.div>
  );
}
