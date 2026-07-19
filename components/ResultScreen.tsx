"use client";

import { motion } from "framer-motion";
import QRCodeDisplay from "./QRCodeDisplay";

interface Props {
  stripUrl: string;
  onNewSession: () => void;
}

export default function ResultScreen({ stripUrl, onNewSession }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 w-full max-w-6xl py-4"
    >
      <div className="shrink-0 animate-pop-in flex items-center justify-center">
        <img
          src={stripUrl}
          alt="Your photostrip"
          className="rounded-2xl shadow-panel"
          style={{
            maxWidth: "min(92vw, 46rem)",
            maxHeight: "86vh",
            width: "auto",
            height: "auto",
          }}
        />
      </div>

      <div className="flex-1 w-full max-w-md lg:max-w-lg flex flex-col items-center gap-7 bg-feu-greenDark rounded-3xl p-8 sm:p-10 shadow-panel border border-feu-gold/20">
        <div className="text-center">
          <h2 className="font-display font-extrabold text-3xl text-feu-cream">
            Looking good!
          </h2>
          <p className="text-feu-cream/70 text-base mt-2 font-body leading-relaxed">
            Download it here, or scan the QR code to send it to your phone.
          </p>
        </div>

        <QRCodeDisplay imageDataUrl={stripUrl} />

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href={stripUrl}
            download={`feu-roosevelt-it-photobooth-${Date.now()}.png`}
            className="text-center flex-1 px-6 py-4 rounded-xl bg-feu-gold text-feu-greenDark font-display font-bold text-base shadow-gold hover:brightness-105 active:scale-95 transition-all"
          >
            Download on this device
          </a>
          <button
            onClick={onNewSession}
            className="flex-1 px-6 py-4 rounded-xl border border-feu-gold/50 text-feu-gold font-display font-semibold text-base hover:bg-feu-gold/10 active:scale-95 transition-all"
          >
            New Session
          </button>
        </div>
      </div>
    </motion.div>
  );
}
