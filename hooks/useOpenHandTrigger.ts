"use client";

import { useEffect, useRef, useState } from "react";

export type HandGestureStatus =
  | "idle"
  | "loading"
  | "ready"
  | "open"
  | "closed"
  | "error";

type HandLandmarker = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number
  ) => { landmarks?: Array<Array<{ x: number; y: number; z: number }>> };
  close: () => void;
};

const WASM_PATH = "/vendor/mediapipe/wasm";
const MODEL_PATH = "/vendor/mediapipe/hand_landmarker.task";
const DETECT_MS = 120;
const COOLDOWN_MS = 3000;
/** How many fingers must be extended to count as an open palm */
const OPEN_FINGER_MIN = 4;
const OPEN_STREAK = 2;
const CLOSED_STREAK = 2;

let landmarkerPromise: Promise<HandLandmarker> | null = null;

async function createLandmarker(): Promise<HandLandmarker> {
  const vision = await import("@mediapipe/tasks-vision");
  const { FilesetResolver, HandLandmarker } = vision;
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

function getLandmarker(): Promise<HandLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = createLandmarker().catch((err) => {
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}

/** MediaPipe hand landmark indices */
const TIPS = [4, 8, 12, 16, 20] as const; // thumb, index, middle, ring, pinky
const PIPS = [3, 6, 10, 14, 18] as const;
const MCPS = [2, 5, 9, 13, 17] as const;

function dist(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/**
 * Count extended fingers from a single hand's landmarks.
 * Works for mirrored/selfie webcam poses.
 */
function countExtendedFingers(
  lm: Array<{ x: number; y: number; z: number }>
): number {
  let extended = 0;

  // Thumb: compare tip–mcp distance vs ip–mcp; also sideways relative to index mcp
  const thumbTip = lm[TIPS[0]];
  const thumbIp = lm[PIPS[0]];
  const thumbMcp = lm[MCPS[0]];
  const indexMcp = lm[MCPS[1]];
  if (dist(thumbTip, indexMcp) > dist(thumbIp, indexMcp) * 1.05) {
    extended += 1;
  }

  // Other fingers: tip farther from wrist than pip is (finger stretched out)
  const wrist = lm[0];
  for (let i = 1; i < 5; i++) {
    const tip = lm[TIPS[i]];
    const pip = lm[PIPS[i]];
    if (dist(tip, wrist) > dist(pip, wrist) * 1.12) {
      extended += 1;
    }
  }

  // Silence unused in thumb path lint
  void thumbMcp;
  return extended;
}

function classifyHand(
  landmarks: Array<Array<{ x: number; y: number; z: number }>> | undefined
): "open" | "closed" | null {
  if (!landmarks?.length) return null;
  const fingers = countExtendedFingers(landmarks[0]);
  if (fingers >= OPEN_FINGER_MIN) return "open";
  if (fingers <= 1) return "closed";
  return null;
}

interface Options {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onOpenHand: () => void;
}

/**
 * Capture trigger: closed fist, then open palm (MediaPipe Hand Landmarker).
 * Runs fully offline from /public/vendor/mediapipe.
 */
export function useOpenHandTrigger({
  videoRef,
  enabled,
  onOpenHand,
}: Options) {
  const [status, setStatus] = useState<HandGestureStatus>("idle");
  const onOpenRef = useRef(onOpenHand);
  const openStreak = useRef(0);
  const closedStreak = useRef(0);
  /** Must see a fist before an open palm will fire */
  const sawClosed = useRef(false);
  const cooldownUntil = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    onOpenRef.current = onOpenHand;
  }, [onOpenHand]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      openStreak.current = 0;
      closedStreak.current = 0;
      sawClosed.current = false;
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let landmarker: HandLandmarker | null = null;

    setStatus("loading");

    (async () => {
      try {
        landmarker = await getLandmarker();
        if (cancelled) return;
        setStatus("ready");

        const tick = () => {
          if (cancelled) return;

          const video = videoRef.current;
          const now = performance.now();

          if (
            !video ||
            !landmarker ||
            video.readyState < 2 ||
            !video.videoWidth ||
            busy.current ||
            Date.now() < cooldownUntil.current
          ) {
            timer = setTimeout(tick, DETECT_MS);
            return;
          }

          busy.current = true;
          try {
            const result = landmarker.detectForVideo(video, now);
            if (cancelled) return;

            const pose = classifyHand(result.landmarks);
            if (pose === "closed") {
              openStreak.current = 0;
              closedStreak.current += 1;
              if (closedStreak.current >= CLOSED_STREAK) {
                sawClosed.current = true;
              }
              setStatus("closed");
            } else if (pose === "open") {
              closedStreak.current = 0;
              if (!sawClosed.current) {
                // Waiting for a fist first — don't fire yet
                openStreak.current = 0;
                setStatus("ready");
              } else {
                openStreak.current += 1;
                setStatus("open");
                if (openStreak.current >= OPEN_STREAK) {
                  openStreak.current = 0;
                  closedStreak.current = 0;
                  sawClosed.current = false;
                  cooldownUntil.current = Date.now() + COOLDOWN_MS;
                  setStatus("ready");
                  onOpenRef.current();
                }
              }
            } else {
              openStreak.current = 0;
              closedStreak.current = 0;
              setStatus(sawClosed.current ? "closed" : "ready");
            }
          } catch (err) {
            console.warn("Hand detect tick failed", err);
            openStreak.current = 0;
            closedStreak.current = 0;
          } finally {
            busy.current = false;
            if (!cancelled) timer = setTimeout(tick, DETECT_MS);
          }
        };

        timer = setTimeout(tick, 300);
      } catch (err) {
        console.error("Hand landmarker load failed", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, videoRef]);

  return { status };
}

/** Warm up the model while the guest picks a template (optional). */
export function preloadHandGesture(): void {
  if (typeof window === "undefined") return;
  void getLandmarker().catch(() => {
    /* surfaced later when camera opens */
  });
}
