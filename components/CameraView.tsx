"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FilterId, getFilterCss } from "@/lib/filters";

interface Props {
  active: boolean;
  filterId?: FilterId;
}

const CameraView = forwardRef<HTMLVideoElement, Props>(function CameraView(
  { active, filterId = "none" },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream;

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
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        setError(
          "Camera access was blocked. Allow camera permissions in your browser and reload."
        );
      });

    return () => {
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
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="mirror w-full h-full object-cover"
      style={{ filter: getFilterCss(filterId) }}
    />
  );
});

export default CameraView;
