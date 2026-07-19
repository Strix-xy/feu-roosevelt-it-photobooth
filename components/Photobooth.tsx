"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CameraView from "./CameraView";
import Countdown from "./Countdown";
import TemplatePreview from "./TemplatePreview";
import LayoutGlyph from "./LayoutGlyph";
import ResultScreen from "./ResultScreen";
import { Stage, TemplateId, TEMPLATES, getCellRects } from "@/lib/types";
import { captureShot, composeStrip } from "@/lib/capture";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-feu-greenDark/70 hover:text-feu-greenDark font-body text-sm font-medium transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

export default function Photobooth() {
  const [stage, setStage] = useState<Stage>("start");
  const [templateId, setTemplateId] = useState<TemplateId>("portrait");
  const [shots, setShots] = useState<string[]>([]);
  const [countdownValue, setCountdownValue] = useState<number | "smile" | null>(null);
  const [flash, setFlash] = useState(false);
  const [finalStrip, setFinalStrip] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const template = TEMPLATES[templateId];
  const rects = getCellRects(template);
  const currentRect = rects[Math.min(shots.length, rects.length - 1)];

  const runSession = useCallback(async () => {
    if (capturing || !videoRef.current) return;
    setCapturing(true);
    const collected: string[] = [];

    for (let i = 0; i < template.shotCount; i++) {
      for (const n of [3, 2, 1]) {
        setCountdownValue(n);
        await sleep(800);
      }
      setCountdownValue("smile");
      await sleep(400);
      setCountdownValue(null);

      setFlash(true);
      const dataUrl = await captureShot(videoRef.current, template, i);
      await sleep(180);
      setFlash(false);

      collected.push(dataUrl);
      setShots([...collected]);

      if (i < template.shotCount - 1) await sleep(500);
    }

    const strip = await composeStrip(collected, template);
    setFinalStrip(strip);
    setStage("review");
    setCapturing(false);
  }, [capturing, template]);

  function goBack() {
    if (stage === "template") {
      setStage("start");
    } else if (stage === "camera") {
      setStage("template");
      setShots([]);
      setCapturing(false);
      setCountdownValue(null);
      setFlash(false);
    }
  }

  function newSession() {
    setStage("start");
    setShots([]);
    setFinalStrip(null);
    setCapturing(false);
    setCountdownValue(null);
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 gap-4">
      {stage === "start" ? (
        <header className="text-center mt-4 sm:mt-8 shrink-0">
          <p className="font-mono text-xs tracking-[0.3em] text-feu-green/70 uppercase mb-1">
            Information Technology Department
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-feu-greenDark tracking-tight">
            FEU Roosevelt <span className="text-feu-gold">IT</span> Photobooth
          </h1>
        </header>
      ) : (
        (stage === "template" || stage === "camera") && (
          <div className="w-full max-w-5xl flex items-center justify-between shrink-0">
            <BackButton onClick={goBack} label="Back" />
            <p className="font-display font-bold text-base sm:text-lg text-feu-greenDark">
              {stage === "template" ? "Choose your strip" : template.label}
            </p>
            <span className="w-12" />
          </div>
        )
      )}

      <AnimatePresence mode="wait">
        {stage === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col items-center gap-6 text-center max-w-md w-full"
          >
            <div
              className="relative w-full rounded-3xl bg-feu-greenDark shadow-panel border border-feu-gold/30 flex flex-col items-center gap-5 p-8 overflow-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,194,14,0.14) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-feu-gold/70 rounded-tl" />
              <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-feu-gold/70 rounded-tr" />
              <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-feu-gold/70 rounded-bl" />
              <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-feu-gold/70 rounded-br" />

              <div className="w-20 h-20 rounded-full bg-feu-gold flex items-center justify-center shadow-gold mt-2">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                    stroke="#052E17"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="13" r="3.4" stroke="#052E17" strokeWidth="1.8" />
                </svg>
              </div>

              <div className="flex gap-2">
                <div className="w-9 h-12 rounded-md bg-feu-cream/10 border border-feu-gold/40" />
                <div className="w-9 h-12 rounded-md bg-feu-cream/10 border border-feu-gold/40" />
                <div className="w-9 h-12 rounded-md bg-feu-cream/10 border border-feu-gold/40" />
              </div>

              <p className="text-feu-cream/85 font-body text-base leading-relaxed">
                Strike a pose — we'll count you in and capture 3 shots
                automatically. Scan the QR code afterward to send it
                straight to your phone.
              </p>

              <p className="font-mono text-[10px] tracking-widest text-feu-gold/60 uppercase">
                ACES · Alliance of Computing Education Students
              </p>
            </div>
            <button
              onClick={() => setStage("template")}
              className="px-8 py-4 rounded-full bg-feu-gold text-feu-greenDark font-display font-bold text-lg shadow-gold hover:brightness-105 active:scale-95 transition-all"
            >
              Start Photobooth
            </button>
          </motion.div>
        )}

        {stage === "template" && (
          <motion.div
            key="template"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-1 flex-col items-center justify-center gap-8 w-full max-w-2xl py-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
              {Object.values(TEMPLATES).map((t) => {
                const selected = t.id === templateId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`flex flex-col items-center justify-center gap-5 p-8 sm:p-10 rounded-3xl border-2 transition-all text-center min-h-[240px] sm:min-h-[280px] ${
                      selected
                        ? "border-feu-gold bg-feu-greenDark shadow-gold scale-[1.02]"
                        : "border-feu-green/20 bg-white hover:border-feu-gold/60"
                    }`}
                  >
                    <div className="h-[128px] flex items-center justify-center">
                      <LayoutGlyph template={t} selected={selected} />
                    </div>
                    <div className="space-y-1.5">
                      <p
                        className={`font-display font-bold text-lg sm:text-xl ${
                          selected ? "text-feu-cream" : "text-feu-greenDark"
                        }`}
                      >
                        {t.label}
                      </p>
                      <p
                        className={`font-body text-sm leading-snug max-w-[16rem] mx-auto ${
                          selected ? "text-feu-cream/70" : "text-feu-ink/60"
                        }`}
                      >
                        {t.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStage("camera")}
              className="px-10 py-4 rounded-full bg-feu-gold text-feu-greenDark font-display font-bold text-lg shadow-gold hover:brightness-105 active:scale-95 transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}

        {stage === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col items-center justify-center gap-4 w-full"
          >
            {/* compact preview — shown above the camera only on narrow screens */}
            <div className={`lg:hidden w-full ${template.id === "landscape" ? "max-w-xl" : "max-w-sm"}`}>
              <TemplatePreview template={template} shots={shots} variant="compact" />
            </div>

            {/* group sizes to its content so camera + strip sit together in the center */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center justify-center max-w-full">
              {/* explicit width on the wrapper — button always matches the camera */}
              <div
                className="flex flex-col items-stretch gap-3 max-w-full"
                style={{
                  width:
                    template.id === "landscape"
                      ? `min(820px, 56vw, calc((100vh - 11rem) * ${currentRect.w / currentRect.h}))`
                      : `min(680px, 48vw, calc((100vh - 11rem) * ${currentRect.w / currentRect.h}))`,
                }}
              >
                <div
                  className="relative w-full rounded-3xl overflow-hidden shadow-panel border-4 border-feu-gold/60 bg-feu-greenDark"
                  style={{ aspectRatio: currentRect.w / currentRect.h }}
                >
                  <CameraView ref={videoRef} active />
                  <Countdown value={countdownValue} />
                  {flash && (
                    <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
                  )}
                  <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-feu-greenDark/70 text-feu-gold text-[10px] font-mono tracking-widest">
                      ● REC
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-feu-greenDark/70 text-feu-gold text-[10px] font-mono tracking-widest">
                      {shots.length}/{template.shotCount}
                    </span>
                  </div>
                </div>

                <button
                  onClick={runSession}
                  disabled={capturing}
                  className="w-full py-2.5 sm:py-3 rounded-full bg-feu-gold text-feu-greenDark font-display font-bold text-base shadow-gold hover:brightness-105 active:scale-95 transition-all disabled:opacity-60 disabled:active:scale-100"
                >
                  {capturing ? "Capturing…" : "Start Capturing"}
                </button>
              </div>

              {/* strip sits beside the camera as one centered pair; height-capped for portrait */}
              <div
                className="hidden lg:block shrink-0"
                style={
                  template.id === "landscape"
                    ? { width: "min(700px, 44vw)" }
                    : {
                        width: "min(260px, calc((100vh - 7rem) * 0.48))",
                        maxHeight: "calc(100vh - 6rem)",
                      }
                }
              >
                <TemplatePreview template={template} shots={shots} variant="sidebar" />
              </div>
            </div>
          </motion.div>
        )}

        {stage === "review" && finalStrip && (
          <motion.div key="review" className="w-full flex-1 flex items-center justify-center">
            <ResultScreen stripUrl={finalStrip} onNewSession={newSession} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
