"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  /** Session id from review upload — when null, show preparing spinner */
  sessionId: string | null;
  error?: string | null;
}

type QrState =
  | { status: "waiting" }
  | { status: "ready"; shareUrl: string; qr: string }
  | { status: "error"; message: string };

export default function QRCodeDisplay({ sessionId, error }: Props) {
  const [state, setState] = useState<QrState>({ status: "waiting" });

  useEffect(() => {
    if (error) {
      setState({ status: "error", message: error });
      return;
    }
    if (!sessionId) {
      setState({ status: "waiting" });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const shareUrl = `${window.location.origin}/s/${sessionId}`;
        const qr = await QRCode.toDataURL(shareUrl, {
          margin: 1,
          width: 440,
          color: { dark: "#052E17", light: "#FAF6EC" },
        });
        if (!cancelled) setState({ status: "ready", shareUrl, qr });
      } catch (err) {
        console.error(err);
        if (!cancelled)
          setState({
            status: "error",
            message: "Couldn't generate the QR code. Please try again.",
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, error]);

  if (state.status === "waiting") {
    return (
      <div className="flex flex-col items-center gap-3 p-8">
        <div className="w-12 h-12 rounded-full border-4 border-feu-gold/30 border-t-feu-gold animate-spin" />
        <p className="text-base text-feu-cream/80 font-body">Preparing your QR code…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="max-w-sm text-center p-4 text-sm text-feu-gold/90 font-body">
        {state.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-feu-cream p-4 sm:p-5 rounded-3xl shadow-gold">
        <img src={state.qr} alt="Scan to download your photo" width={240} height={240} />
      </div>
      <p className="text-sm text-feu-cream/70 font-body text-center max-w-[260px]">
        Scan with your phone camera to save this photostrip
      </p>
      <a
        href={state.shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono text-feu-gold/80 hover:text-feu-gold underline underline-offset-2"
      >
        Open link
      </a>
    </div>
  );
}
