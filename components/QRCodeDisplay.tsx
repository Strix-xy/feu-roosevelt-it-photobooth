"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import QRCode from "qrcode";

interface Props {
  imageDataUrl: string;
}

type UploadState =
  | { status: "uploading" }
  | { status: "ready"; shareUrl: string; qr: string }
  | { status: "error"; message: string };

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = /data:([^;]+);/.exec(header)?.[1] ?? "image/png";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
  return new File([buffer], filename, { type: mime });
}

export default function QRCodeDisplay({ imageDataUrl }: Props) {
  const [state, setState] = useState<UploadState>({ status: "uploading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "uploading" });

    (async () => {
      try {
        const sessionId = crypto.randomUUID();
        const file = dataUrlToFile(imageDataUrl, `${sessionId}.png`);

        await upload(`photobooth/${sessionId}.png`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: "image/png",
        });

        if (cancelled) return;

        // Short branded link — each session gets a unique /s/{id} page
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
            message:
              "Couldn't generate the QR code. On Vercel, create a Blob store (Public) so BLOB_READ_WRITE_TOKEN is set, then try again.",
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageDataUrl]);

  if (state.status === "uploading") {
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
