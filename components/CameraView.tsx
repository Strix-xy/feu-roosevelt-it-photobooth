"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { FilterId, getFilterCss } from "@/lib/filters";

interface Props {
  active: boolean;
  filterId?: FilterId;
}

const CameraView = forwardRef<HTMLVideoElement, Props>(function CameraView(
  { active, filterId = "none" },
  ref
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | undefined;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1440 },
          height: { ideal: 1440 },
        },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const el = videoRef.current;
        if (!el) return;
        el.srcObject = s;
        const syncSize = () => {
          if (el.videoWidth > 0) {
            el.width = el.videoWidth;
            el.height = el.videoHeight;
          }
        };
        el.addEventListener("loadedmetadata", syncSize);
        if (el.readyState >= 1) syncSize();
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Camera access was blocked. Allow camera permissions in your browser and reload."
          );
        }
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8 text-feu-cream">
        <p className="font-body text-sm">{error}</p>
      </div>
    );
  }

  return (
    <video
      ref={setVideoRef}
      autoPlay
      playsInline
      muted
      className="mirror w-full h-full object-cover"
      style={{ filter: getFilterCss(filterId) }}
    />
  );
});

export default CameraView;
