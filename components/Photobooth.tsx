"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CameraView from "./CameraView";
import Countdown from "./Countdown";
import CountdownChips from "./CountdownChips";
import TemplatePreview from "./TemplatePreview";
import LayoutGlyph from "./LayoutGlyph";
import StartWelcomeCard from "./StartWelcomeCard";
import ShotConfirm from "./ShotConfirm";
import ResultScreen from "./ResultScreen";
import IdleShowcase from "./IdleShowcase";
import BrandLogos from "./BrandLogos";
import HandGestureTip from "./HandGestureTip";
import { useOpenHandTrigger, preloadHandGesture } from "@/hooks/useOpenHandTrigger";
import { Stage, TemplateId, TEMPLATES, getCellRects, isWideTemplate } from "@/lib/types";
import { BorderStyleId, BORDER_STYLES, BORDER_STYLE_LIST, DEFAULT_FOOTER } from "@/lib/borders";
import { FilterId, FILTER_LIST, FILTERS, DEFAULT_FILTER } from "@/lib/filters";
import {
  CountdownPresetId,
  COUNTDOWN_PRESETS,
  DEFAULT_COUNTDOWN,
} from "@/lib/countdown";
import { captureShot, composeStrip } from "@/lib/capture";
import {
  unlockAudio,
  setMuted,
  playCountdownTick,
  playSmileCue,
  playShutter,
  playSuccess,
  playClick,
  playConfirm,
  playNav,
} from "@/lib/sounds";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const IDLE_MS = 60_000;

function cycleIndex(length: number, current: number, dir: 1 | -1): number {
  return (current + dir + length) % length;
}

function FilterNavButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous filter" : "Next filter"}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        playNav();
        onClick();
      }}
      className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-feu-greenDark/75 text-feu-gold border border-feu-gold/40 backdrop-blur-sm hover:bg-feu-greenDark/90 active:scale-95 transition-all disabled:opacity-40"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        {dir === "prev" ? (
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={() => {
        playClick();
        onClick();
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-2.5 rounded-lg text-feu-greenDark/65 hover:text-feu-greenDark hover:bg-feu-greenDark/[0.05] font-body text-sm font-medium transition-colors"
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
  const [filterId, setFilterId] = useState<FilterId>(DEFAULT_FILTER);
  const [countdownPreset, setCountdownPreset] =
    useState<CountdownPresetId>(DEFAULT_COUNTDOWN);
  const [footerText, setFooterText] = useState(DEFAULT_FOOTER);
  const [shots, setShots] = useState<string[]>([]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | "smile" | null>(null);
  const [flash, setFlash] = useState(false);
  const [finalStrip, setFinalStrip] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const capturingRef = useRef(false);
  const stageRef = useRef<Stage>(stage);

  const template = TEMPLATES[templateId];
  const border = BORDER_STYLES[borderId];
  const rects = getCellRects(template);
  const previewIndex =
    retakeIndex !== null
      ? retakeIndex
      : Math.min(shots.length, rects.length - 1);
  const currentRect = rects[previewIndex];
  const wide = isWideTemplate(template);
  const pace = COUNTDOWN_PRESETS[countdownPreset];

  useEffect(() => {
    capturingRef.current = capturing;
  }, [capturing]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Warm gesture model early so camera stage is ready to detect
  useEffect(() => {
    if (stage === "template" || stage === "camera") {
      preloadHandGesture();
    }
  }, [stage]);

  // Keep viewport at the top when switching stages (avoids landing mid-page)
  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [stage]);

  function resetSessionFields() {
    setShots([]);
    setFinalStrip(null);
    setCapturing(false);
    setComposing(false);
    setCountdownValue(null);
    setFlash(false);
    setRetakeIndex(null);
    setFooterText(DEFAULT_FOOTER);
    setBorderId("feu");
    setFilterId(DEFAULT_FILTER);
    setCountdownPreset(DEFAULT_COUNTDOWN);
  }

  const goIdle = useCallback(() => {
    if (capturingRef.current) return;
    resetSessionFields();
    setStage("idle");
  }, []);

  // 60s idle → showcase (paused while capturing or already idle)
  useEffect(() => {
    if (stage === "idle") return;

    let timer: ReturnType<typeof setTimeout>;

    const bump = () => {
      clearTimeout(timer);
      if (capturingRef.current || stageRef.current === "idle") return;
      timer = setTimeout(goIdle, IDLE_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "pointermove",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    bump();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [stage, goIdle, capturing]);

  const runSession = useCallback(async () => {
    if (capturingRef.current || !videoRef.current) return;
    unlockAudio();
    setCapturing(true);
    const collected: string[] = [];
    const { beats, beatMs, smileMs, betweenShotsMs } = pace;

    try {
      for (let i = 0; i < template.shotCount; i++) {
        for (const n of beats) {
          setCountdownValue(n);
          playCountdownTick(n);
          await sleep(beatMs);
        }
        setCountdownValue("smile");
        playSmileCue();
        await sleep(smileMs);
        setCountdownValue(null);

        if (!videoRef.current) break;
        setFlash(true);
        playShutter();
        const dataUrl = await captureShot(videoRef.current, template, i);
        await sleep(180);
        setFlash(false);

        collected.push(dataUrl);
        setShots([...collected]);

        if (i < template.shotCount - 1) await sleep(betweenShotsMs);
      }

      if (collected.length === template.shotCount) {
        setRetakeIndex(null);
        playSuccess();
        setStage("confirm");
      }
    } finally {
      setCapturing(false);
      setCountdownValue(null);
      setFlash(false);
    }
  }, [template, pace]);

  const runRetakeShot = useCallback(async () => {
    if (capturingRef.current || !videoRef.current || retakeIndex === null) return;
    unlockAudio();
    setCapturing(true);
    const index = retakeIndex;
    const { beats, beatMs, smileMs } = pace;

    try {
      for (const n of beats) {
        setCountdownValue(n);
        playCountdownTick(n);
        await sleep(beatMs);
      }
      setCountdownValue("smile");
      playSmileCue();
      await sleep(smileMs);
      setCountdownValue(null);

      if (!videoRef.current) return;
      setFlash(true);
      playShutter();
      const dataUrl = await captureShot(videoRef.current, template, index);
      await sleep(180);
      setFlash(false);

      setShots((prev) => {
        const next = [...prev];
        next[index] = dataUrl;
        return next;
      });
      setRetakeIndex(null);
      playSuccess();
      setStage("confirm");
    } finally {
      setCapturing(false);
      setCountdownValue(null);
      setFlash(false);
    }
  }, [template, retakeIndex, pace]);

  async function handleKeepAll() {
    if (composing) return;
    setComposing(true);
    try {
      const strip = await composeStrip(shots, template, {
        border,
        footerText,
        filterId,
      });
      setFinalStrip(strip);
      playSuccess();
      setStage("review");
    } finally {
      setComposing(false);
    }
  }

  function toggleMute() {
    const next = !soundMuted;
    setSoundMuted(next);
    setMuted(next);
    if (!next) {
      unlockAudio();
      playClick();
    }
  }

  function handleRetake(index: number) {
    setRetakeIndex(index);
    setStage("camera");
  }

  function goBack() {
    if (stage === "template") {
      setStage("start");
    } else if (stage === "camera") {
      if (retakeIndex !== null) {
        setRetakeIndex(null);
        setStage("confirm");
        return;
      }
      setStage("template");
      setShots([]);
      setCapturing(false);
      setCountdownValue(null);
      setFlash(false);
    } else if (stage === "confirm") {
      // Keep shots — guests may only want to tweak border/filter on camera
      setStage("camera");
      setCapturing(false);
      setCountdownValue(null);
      setFlash(false);
      setRetakeIndex(null);
    }
  }

  function newSession() {
    resetSessionFields();
    setStage("start");
  }

  function dismissIdle() {
    resetSessionFields();
    setStage("start");
  }

  function stepBorder(dir: 1 | -1) {
    if (capturing) return;
    const idx = BORDER_STYLE_LIST.findIndex((b) => b.id === borderId);
    const next = cycleIndex(BORDER_STYLE_LIST.length, Math.max(0, idx), dir);
    setBorderId(BORDER_STYLE_LIST[next].id);
  }

  function stepFilter(dir: 1 | -1) {
    if (capturing) return;
    const idx = FILTER_LIST.findIndex((f) => f.id === filterId);
    const next = cycleIndex(FILTER_LIST.length, Math.max(0, idx), dir);
    setFilterId(FILTER_LIST[next].id);
  }

  const stageTitle =
    stage === "template"
      ? "Choose your strip"
      : stage === "confirm"
        ? "Confirm your shots"
        : retakeIndex !== null
          ? `Retake shot ${retakeIndex + 1}`
          : template.label;

  const filterLabel = FILTERS[filterId].label;
  const filterIndex = FILTER_LIST.findIndex((f) => f.id === filterId) + 1;
  const shotsComplete =
    shots.length === template.shotCount && retakeIndex === null;

  const gestureEnabled =
    stage === "camera" &&
    !capturing &&
    (retakeIndex !== null || !shotsComplete);

  const handleOpenHand = useCallback(() => {
    unlockAudio();
    playConfirm();
    if (retakeIndex !== null) {
      void runRetakeShot();
    } else if (!shotsComplete) {
      void runSession();
    }
  }, [retakeIndex, shotsComplete, runRetakeShot, runSession]);

  useOpenHandTrigger({
    videoRef,
    enabled: gestureEnabled,
    onOpenHand: handleOpenHand,
  });

  if (stage === "idle") {
    return <IdleShowcase onDismiss={dismissIdle} />;
  }

  return (
    <main
      className={`relative min-h-screen flex flex-col items-center p-4 sm:p-6 ${
        stage === "start" ? "justify-center" : "gap-4"
      }`}
    >
      {stage === "start" ? (
        <>
          <BrandLogos size="md" layout="split" />
          <motion.div className="flex flex-col items-center justify-center w-full max-w-lg gap-7 sm:gap-8 text-center min-h-[calc(100dvh-3rem)] pb-14 pt-2">
          <header className="shrink-0 space-y-3 animate-fade-up">
            <p className="font-mono text-[11px] sm:text-xs tracking-[0.32em] text-feu-green/75 uppercase">
              Information Technology Department
            </p>
            <h1 className="font-display font-extrabold text-[2.15rem] leading-[1.1] sm:text-5xl text-feu-greenDark tracking-tight">
              FEU Roosevelt
              <span className="block mt-1.5 sm:mt-2">
                <span className="text-feu-gold">IT</span> Photobooth
              </span>
            </h1>
            <p className="font-body text-sm sm:text-base text-feu-ink/55 max-w-sm mx-auto leading-relaxed">
              Campus strips, instant QR — strike a pose and take one home.
            </p>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 w-full max-w-md"
            >
              <StartWelcomeCard />
              <div className="relative">
                <span
                  className="absolute inset-0 rounded-2xl bg-feu-gold/35 animate-pulse-ring"
                  aria-hidden
                />
                <button
                  onClick={() => {
                    unlockAudio();
                    playConfirm();
                    setStage("template");
                  }}
                  className="btn-gold relative px-9 py-3.5 rounded-2xl text-base sm:text-lg"
                >
                  Start Photobooth
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        </>
      ) : (
        <>
          {(stage === "template" || stage === "camera" || stage === "confirm") && (
            <motion.div className="stage-shell flex items-center justify-between shrink-0 pt-1">
              <BackButton onClick={goBack} label="Back" />
              <div className="text-center px-2">
                <p className="font-mono text-[9px] tracking-[0.28em] text-feu-green/50 uppercase mb-0.5 hidden sm:block">
                  FEU Roosevelt · IT
                </p>
                <p className="font-display font-bold text-base sm:text-lg text-feu-greenDark">
                  {stageTitle}
                </p>
              </div>
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
                        onClick={() => {
                          playClick();
                          setTemplateId(t.id);
                        }}
                        className={`flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 text-center min-h-[220px] sm:min-h-[260px] ${
                          selected
                            ? "border-feu-gold bg-feu-greenDark shadow-gold scale-[1.02] bg-panel-shine"
                            : "border-feu-green/15 bg-white/80 backdrop-blur-sm shadow-panel-lift hover:border-feu-gold/55 hover:-translate-y-0.5"
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
                  onClick={() => {
                    playConfirm();
                    setStage("camera");
                  }}
                  className="btn-gold px-10 py-4 rounded-2xl text-lg"
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
                  <TemplatePreview
                    template={template}
                    shots={shots}
                    border={border}
                    filterId={filterId}
                    variant="compact"
                    onBorderPrev={() => stepBorder(-1)}
                    onBorderNext={() => stepBorder(1)}
                    borderNavDisabled={capturing}
                  />
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
                      className="relative w-full rounded-3xl overflow-hidden shadow-panel border-4 bg-feu-greenDark ring-1 ring-black/10"
                      style={{
                        aspectRatio: currentRect.w / currentRect.h,
                        borderColor: `${border.accent}99`,
                      }}
                    >
                      <CameraView ref={videoRef} active filterId={filterId} />
                      <Countdown value={countdownValue} />
                      {flash && (
                        <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
                      )}
                      <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none z-10">
                        <span className="px-2.5 py-1 rounded-full bg-feu-greenDark/70 text-feu-gold text-[10px] font-mono tracking-widest">
                          ● REC
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-feu-greenDark/70 text-feu-gold text-[10px] font-mono tracking-widest">
                          {retakeIndex !== null
                            ? `Retake ${retakeIndex + 1}`
                            : `${shots.length}/${template.shotCount}`}
                        </span>
                      </div>

                      {/* Filter prev / next + label inside capture window */}
                      <div className="absolute inset-y-0 left-2 flex items-center z-10">
                        <FilterNavButton
                          dir="prev"
                          disabled={capturing}
                          onClick={() => stepFilter(-1)}
                        />
                      </div>
                      <div className="absolute inset-y-0 right-2 flex items-center z-10">
                        <FilterNavButton
                          dir="next"
                          disabled={capturing}
                          onClick={() => stepFilter(1)}
                        />
                      </div>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-feu-greenDark/80 text-feu-cream border border-feu-gold/35 backdrop-blur-sm">
                          <span className="font-mono text-[9px] tracking-widest text-feu-gold/80 uppercase">
                            Filter
                          </span>
                          <span className="font-display font-bold text-sm text-feu-gold">
                            {filterLabel}
                          </span>
                          <span className="font-mono text-[10px] text-feu-cream/50">
                            {filterIndex}/{FILTER_LIST.length}
                          </span>
                        </span>
                      </div>

                      <HandGestureTip active={gestureEnabled} durationMs={6000} />
                    </div>

                    <CountdownChips
                      selectedId={countdownPreset}
                      onSelect={setCountdownPreset}
                      disabled={capturing}
                    />

                    <button
                      onClick={() => {
                        playConfirm();
                        if (retakeIndex !== null) runRetakeShot();
                        else if (shotsComplete) setStage("confirm");
                        else runSession();
                      }}
                      disabled={capturing}
                      className="btn-gold w-full py-2.5 sm:py-3 rounded-2xl text-base"
                    >
                      {capturing
                        ? "Capturing…"
                        : retakeIndex !== null
                          ? `Retake shot ${retakeIndex + 1}`
                          : shotsComplete
                            ? "Review shots"
                            : "Start Capturing"}
                    </button>
                  </div>

                  <div
                    className="hidden lg:block shrink-0"
                    style={
                      wide
                        ? { width: "min(700px, 44vw)" }
                        : {
                            width: "min(280px, calc((100vh - 7rem) * 0.48))",
                            maxHeight: "calc(100vh - 6rem)",
                          }
                    }
                  >
                    <TemplatePreview
                      template={template}
                      shots={shots}
                      border={border}
                      filterId={filterId}
                      variant="sidebar"
                      onBorderPrev={() => stepBorder(-1)}
                      onBorderNext={() => stepBorder(1)}
                      borderNavDisabled={capturing}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {stage === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="w-full flex-1 flex items-center justify-center"
              >
                <ShotConfirm
                  template={template}
                  shots={shots}
                  border={border}
                  filterId={filterId}
                  onRetake={handleRetake}
                  onKeepAll={handleKeepAll}
                  composing={composing}
                />
              </motion.div>
            )}

            {stage === "review" && finalStrip && (
              <motion.div
                key="review"
                className="w-full flex-1 flex items-center justify-center"
              >
                <ResultScreen
                  stripUrl={finalStrip}
                  shots={shots}
                  template={template}
                  border={border}
                  footerText={footerText}
                  filterId={filterId}
                  onFooterChange={setFooterText}
                  onStripUpdate={setFinalStrip}
                  onNewSession={newSession}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={soundMuted ? "Unmute sound effects" : "Mute sound effects"}
        title={soundMuted ? "Unmute" : "Mute"}
        className="fixed bottom-2 left-4 sm:left-6 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-feu-greenDark/85 text-feu-cream/90 border border-feu-gold/30 backdrop-blur-md hover:bg-feu-greenDark hover:border-feu-gold/50 transition-colors shadow-panel-lift"
      >
        {soundMuted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M23 9l-6 6M17 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        <span className="font-mono text-[10px] tracking-wider uppercase hidden sm:inline">
          {soundMuted ? "Muted" : "SFX"}
        </span>
      </button>

      <p
        className="fixed bottom-2 right-4 sm:right-6 text-right font-mono text-[10px] tracking-widest text-feu-greenDark/30 pointer-events-none select-none"
        aria-hidden
      >
        Developed by Strix
      </p>
    </main>
  );
}
