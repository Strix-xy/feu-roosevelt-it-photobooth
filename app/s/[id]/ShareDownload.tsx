"use client";

interface Props {
  imageUrl: string;
}

export default function ShareDownload({ imageUrl }: Props) {
  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <div className="ambient-layer" aria-hidden>
        <div className="ambient-orb ambient-orb--green" />
        <div className="ambient-orb ambient-orb--gold" />
      </div>

      <header className="text-center relative">
        <p className="font-mono text-[10px] tracking-[0.3em] text-feu-green uppercase mb-1">
          FEU Roosevelt · IT Photobooth
        </p>
        <h1 className="font-display font-extrabold text-2xl text-feu-greenDark">
          Your photostrip
        </h1>
      </header>

      <img
        src={imageUrl}
        alt="Your photostrip"
        className="relative rounded-2xl shadow-panel max-w-full"
        style={{ maxHeight: "62vh", width: "auto", height: "auto" }}
      />

      <div className="relative flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <a
          href={imageUrl}
          download="feu-roosevelt-it-photostrip.png"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center flex-1 px-6 py-4 rounded-full bg-feu-gold text-feu-greenDark font-display font-bold shadow-gold hover:brightness-105 active:scale-95 transition-all"
        >
          Download / Save
        </a>
      </div>

      <p className="relative text-center text-sm text-feu-ink/60 font-body max-w-xs">
        On iPhone: tap and hold the image → Save to Photos.
        On Android: tap Download, or hold the image to save.
      </p>
    </main>
  );
}
