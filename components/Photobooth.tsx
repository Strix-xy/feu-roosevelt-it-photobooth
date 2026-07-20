"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CameraView from "./CameraView";
import Countdown from "./Countdown";
import TemplatePreview from "./TemplatePreview";
import LayoutGlyph from "./LayoutGlyph";
import BorderCarousel from "./BorderCarousel";
import StartWelcomeCard from "./StartWelcomeCard";
import ResultScreen from "./ResultScreen";
import { Stage, TemplateId, TEMPLATES, getCellRects, isWideTemplate } from "@/lib/types";
import { BorderStyleId, BORDER_STYLES, DEFAULT_FOOTER } from "@/lib/borders";
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
  const [borderId, setBorderId] = useState<BorderStyleId>("feu");
  const [footerText, setFooterText] = useState(DEFAULT_FOOTER);
  const [shots, setShots] = useState<string[]>([]);
  const [countdownValue, setCountdownValue] = useState<number | "smile" | null>(null);
  const [flash, setFlash] = useState(false);
  const [finalStrip, setFinalStrip] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const template = TEMPLATES[templateId];
  const border = BORDER_STYLES[borderId];
  const rects = getCellRects(template);
  const currentRect = rects[Math.min(shots.length, rects.length - 1)];
  const wide = isWideTemplate(template);

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

    const strip = await composeStrip(collected, template, { border, footerText });
    setFinalStrip(strip);
    setStage("review");
    setCapturing(false);
  }, [capturing, template, border, footerText]);

  function goBack() {
    if (stage === "template") {
      setStage("start");
    } else if (stage === "border") {
      setStage("template");
    } else if (stage === "camera") {
      setStage("border");
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
    setFooterText(DEFAULT_FOOTER);
    setBorderId("feu");
  }

  const stageTitle =
    stage === "template"
      ? "Choose your strip"
      : stage === "border"
        ? "Choose your border"
        : template.label;

  return (
    <main
      className={`min-h-screen flex flex-col items-center p-4 sm:p-6 ${
        stage === "start" ? "justify-center" : "gap-4"
      }`}
    >
      {stage === "start" ? (
        <motion.div className="flex flex-col items-center justify-center w-full max-w-md gap-6 sm:gap-8 text-center min-h-[calc(100dvh-3rem)]">
          <header className="shrink-0">
            <p className="font-mono text-xs tracking-[0.3em] text-feu-green/70 uppercase mb-1">
              Information Technology Department
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-feu-greenDark tracking-tight">
              FEU Roosevelt <span className="text-feu-gold">IT</span> Photobooth
            </h1>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <StartWelcomeCard />
              <button
                onClick={() => setStage("template")}
                className="px-8 py-4 rounded-full bg-feu-gold text-feu-greenDark font-display font-bold text-lg shadow-gold hover:brightness-105 active:scale-95 transition-all"
              >
                Start Photobooth
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : (
        <>
      {(stage === "template" || stage === "border" || stage === "camera") && (
          <motion.div className="w-full max-w-5xl flex items-center justify-between shrink-0">
            <BackButton onClick={goBack} label="Back" />
            <p className="font-display font-bold text-base sm:text-lg text-feu-greenDark">
              {stageTitle}
            </p>
            <span className="w-12" />
          </motion.div>
          )}

      <AnimatePresence mode="wait">
        {stage === "template" && (
          <motion.div
            key="template"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-1 flex-col items-center justify-center gap-8 w-full max-w-3xl py-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
              {Object.values(TEMPLATES).map((t) => {
                const selected = t.id === templateId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border-2 transition-all text-center min-h-[220px] sm:min-h-[260px] ${
                      selected
                        ? "border-feu-gold bg-feu-greenDark shadow-gold scale-[1.02]"
                        : "border-feu-green/20 bg-white hover:border-feu-gold/60"
                    }`}
                  >
                    <div className="h-[112px] flex items-center justify-center">
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
                      <p
                        className={`font-mono text-[10px] tracking-wider uppercase ${
                          selected ? "text-feu-gold/70" : "text-feu-green/50"
                        }`}
                      >
                        {t.shotCount} shots
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStage("border")}
              className="px-10 py-4 rounded-full bg-feu-gold text-feu-greenDark font-display font-bold text-lg shadow-gold hover:brightness-105 active:scale-95 transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}

        {stage === "border" && (
          <motion.div
            key="border"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-1 flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-4xl py-4 sm:py-6"
          >
            <p className="text-center font-body text-sm sm:text-base text-feu-ink/60 max-w-lg px-4">
              Browse the full strip design below — header, photo frames, and footer.
              Take your time, then continue when you&apos;re happy with your pick.
            </p>
            <BorderCarousel selectedId={borderId} onSelect={setBorderId} />
            <button
              onClick={() => setStage("camera")}
              className="px-10 py-4 rounded-full bg-feu-gold text-feu-greenDark font-display font-bold text-lg shadow-gold hover:brightness-105 active:scale-95 transition-all"
            >
              Continue to Camera
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
            <div className={`lg:hidden w-full ${wide ? "max-w-xl" : "max-w-sm"}`}>
              <TemplatePreview template={template} shots={shots} border={border} variant="compact" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center justify-center max-w-full">
              <div
                className="flex flex-col items-stretch gap-3 max-w-full"
                style={{
                  width: wide
                    ? `min(820px, 56vw, calc((100vh - 11rem) * ${currentRect.w / currentRect.h}))`
                    : `min(680px, 48vw, calc((100vh - 11rem) * ${currentRect.w / currentRect.h}))`,
                }}
              >
                <div
                  className="relative w-full rounded-3xl overflow-hidden shadow-panel border-4 bg-feu-greenDark"
                  style={{
                    aspectRatio: currentRect.w / currentRect.h,
                    borderColor: `${border.accent}99`,
                  }}
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

              <div
                className="hidden lg:block shrink-0"
                style={
                  wide
                    ? { width: "min(700px, 44vw)" }
                    : {
                        width: "min(260px, calc((100vh - 7rem) * 0.48))",
                        maxHeight: "calc(100vh - 6rem)",
                      }
                }
              >
                <TemplatePreview
                  template={template}
                  shots={shots}
                  border={border}
                  variant="sidebar"
                />
              </div>
            </div>
          </motion.div>
        )}

        {stage === "review" && finalStrip && (
          <motion.div key="review" className="w-full flex-1 flex items-center justify-center">
            <ResultScreen
              stripUrl={finalStrip}
              shots={shots}
              template={template}
              border={border}
              footerText={footerText}
              onFooterChange={setFooterText}
              onStripUpdate={setFinalStrip}
              onNewSession={newSession}
            />
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      <p
        className="fixed bottom-3 left-0 right-0 text-center font-mono text-[10px] tracking-widest text-feu-greenDark/25 pointer-events-none select-none"
        aria-hidden
      >
        Developed by Strix - Zy
      </p>
    </main>
  );
}
