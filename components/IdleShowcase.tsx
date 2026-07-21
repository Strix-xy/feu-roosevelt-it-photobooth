"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playClick } from "@/lib/sounds";

interface GalleryItem {
  url: string;
  uploadedAt: string;
}

interface Props {
  onDismiss: () => void;
}

const SLIDE_MS = 4500;

export default function IdleShowcase({ onDismiss }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = (await res.json()) as { items?: GalleryItem[] };
        if (!cancelled) setItems(data.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [items.length]);

  const current = items[index];

  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        onDismiss();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer border-0 p-0 text-left"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #0E6B34 0%, #052E17 55%, #031a0d 100%)",
      }}
      aria-label="Tap to start photobooth"
    >
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #FFC20E 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 w-full max-w-5xl px-4 sm:px-8">
        <header className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-feu-gold/70 uppercase mb-2">
            FEU Roosevelt · IT Department
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-feu-cream tracking-tight">
            Photobooth <span className="text-feu-gold">Showcase</span>
          </h1>
        </header>

        <div className="relative w-full flex items-center justify-center min-h-[42vh] sm:min-h-[52vh]">
          {loaded && items.length === 0 && (
            <div className="text-center space-y-3 px-6">
              <p className="font-display font-bold text-2xl text-feu-cream">
                Ready when you are
              </p>
              <p className="font-body text-feu-cream/60 text-base max-w-md mx-auto">
                Be the first strip on the wall — tap anywhere to start.
              </p>
            </div>
          )}

          {current && (
            <AnimatePresence mode="wait">
              <motion.img
                key={current.url}
                src={current.url}
                alt="Recent photostrip"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7 }}
                className="max-h-[58vh] sm:max-h-[64vh] max-w-full w-auto rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-feu-gold/25"
              />
            </AnimatePresence>
          )}
        </div>

        <p className="font-display font-bold text-feu-gold text-lg sm:text-xl animate-pulse">
          Tap anywhere to start
        </p>
      </div>
    </button>
  );
}
