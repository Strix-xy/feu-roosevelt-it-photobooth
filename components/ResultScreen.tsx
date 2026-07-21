"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import QRCodeDisplay from "./QRCodeDisplay";
import { BorderStyle } from "@/lib/borders";
import { FilterId } from "@/lib/filters";
import { TAGLINE_PRESETS } from "@/lib/taglines";
import { TemplateConfig } from "@/lib/types";
import { composeStrip } from "@/lib/capture";
import { uploadStrip } from "@/lib/uploadStrip";
import { playClick, playConfirm } from "@/lib/sounds";

interface Props {
  stripUrl: string;
  shots: string[];
  template: TemplateConfig;
  border: BorderStyle;
  footerText: string;
  filterId: FilterId;
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
  filterId,
  onFooterChange,
  onStripUpdate,
  onNewSession,
}: Props) {
  const [recomposing, setRecomposing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const skipInitial = useRef(true);
  const uploadedForUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!stripUrl || uploadedForUrl.current === stripUrl) return;
    let cancelled = false;
    setSessionId(null);
    setUploadError(null);

    (async () => {
      try {
        const result = await uploadStrip(stripUrl);
        if (!cancelled) {
          uploadedForUrl.current = stripUrl;
          setSessionId(result.sessionId);
        }
      } catch (err) {
        console.error("review upload failed", err);
        if (!cancelled)
          setUploadError(
            "Couldn't upload for QR/gallery. On Vercel, create a Blob store (Public) so BLOB_READ_WRITE_TOKEN is set. Download still works."
          );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stripUrl]);

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setRecomposing(true);
      try {
        const url = await composeStrip(shots, template, {
          border,
          footerText,
          filterId,
        });
        if (!cancelled) {
          uploadedForUrl.current = null;
          onStripUpdate(url);
        }
      } finally {
        if (!cancelled) setRecomposing(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [footerText, filterId, shots, template, border, onStripUpdate]);

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

      <div className="flex-1 w-full max-w-md lg:max-w-lg flex flex-col gap-5 bg-feu-greenDark rounded-3xl p-7 sm:p-9 shadow-panel border border-feu-gold/20">
        <header className="text-center space-y-1.5">
          <h2 className="font-display font-extrabold text-3xl text-feu-cream">
            Looking good!
          </h2>
          <p className="text-feu-cream/65 text-sm font-body leading-relaxed">
            Personalise your footer, then download or scan the QR.
          </p>
        </header>

        <section className="w-full rounded-2xl bg-feu-cream/[0.06] border border-feu-gold/15 p-4 sm:p-5 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="footer-tagline"
              className="font-mono text-[10px] tracking-widest text-feu-gold/80 uppercase"
            >
              Footer tagline
            </label>
            <span className="font-mono text-[10px] text-feu-cream/35">
              {footerText.length}/80
            </span>
          </div>

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

          <div>
            <p className="font-mono text-[9px] tracking-widest text-feu-cream/40 uppercase mb-2">
              Quick picks
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {TAGLINE_PRESETS.map((preset) => {
                const selected = footerText === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      playClick();
                      onFooterChange(preset);
                    }}
                    className={`text-left px-3 py-2 rounded-lg font-mono text-[11px] leading-snug transition-all active:scale-[0.98] truncate ${
                      selected
                        ? "bg-feu-gold text-feu-greenDark"
                        : "bg-feu-cream/8 text-feu-cream/70 hover:bg-feu-cream/14 border border-feu-gold/20"
                    }`}
                    title={preset}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="w-full flex flex-col items-center gap-3 py-1">
          <p className="font-mono text-[10px] tracking-widest text-feu-gold/70 uppercase">
            Scan to save
          </p>
          <QRCodeDisplay sessionId={sessionId} error={uploadError} />
        </section>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-1">
          <a
            href={stripUrl}
            download={`feu-roosevelt-it-photobooth-${Date.now()}.png`}
            onClick={() => playConfirm()}
            className="text-center flex-1 px-6 py-3.5 rounded-xl bg-feu-gold text-feu-greenDark font-display font-bold text-base shadow-gold hover:brightness-105 active:scale-95 transition-all"
          >
            Download
          </a>
          <button
            onClick={() => {
              playClick();
              onNewSession();
            }}
            className="flex-1 px-6 py-3.5 rounded-xl border border-feu-gold/50 text-feu-gold font-display font-semibold text-base hover:bg-feu-gold/10 active:scale-95 transition-all"
          >
            New Session
          </button>
        </div>
      </div>
    </motion.div>
  );
}
