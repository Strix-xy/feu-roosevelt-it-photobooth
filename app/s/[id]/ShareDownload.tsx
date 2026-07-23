"use client";

import BrandLogos from "@/components/BrandLogos";

interface Props {
  imageUrl: string;
}

export default function ShareDownload({ imageUrl }: Props) {
  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 gap-7">
      <div className="ambient-layer" aria-hidden>
        <div className="ambient-orb ambient-orb--green" />
        <div className="ambient-orb ambient-orb--gold" />
      </div>

      <header className="text-center relative space-y-3 animate-fade-up">
        <BrandLogos size="sm" />
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-[0.32em] text-feu-green/80 uppercase">
            FEU Roosevelt · IT Photobooth
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-feu-greenDark tracking-tight">
            Your photostrip
          </h1>
          <p className="font-body text-sm text-feu-ink/55 max-w-xs mx-auto">
            Save it now — this link stays with the strip you just shot.
          </p>
        </div>
      </header>

      <div className="relative animate-pop-in">
        <div
          className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,194,14,0.35) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <img
          src={imageUrl}
          alt="Your photostrip"
          className="relative rounded-2xl shadow-panel ring-1 ring-feu-gold/25 max-w-full"
          style={{ maxHeight: "58vh", width: "auto", height: "auto" }}
        />
      </div>

      <div className="relative flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <a
          href={imageUrl}
          download="feu-roosevelt-it-photostrip.png"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold text-center flex-1 px-6 py-4 rounded-2xl text-base"
        >
          Download / Save
        </a>
      </div>

      <p className="relative text-center text-sm text-feu-ink/55 font-body max-w-xs leading-relaxed">
        On iPhone: tap and hold the image → Save to Photos.
        On Android: tap Download, or hold the image to save.
      </p>
    </main>
  );
}
