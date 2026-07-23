"use client";

import { useEffect, useMemo, useState } from "react";
import { playClick } from "@/lib/sounds";
import BrandLogos from "./BrandLogos";

interface GalleryItem {
  url: string;
  uploadedAt: string;
}

type OrientedItem = GalleryItem & {
  orientation: "portrait" | "landscape";
  aspect: number;
};

interface Props {
  onDismiss: () => void;
}

function probeOrientation(url: string): Promise<OrientedItem> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 1;
      const h = img.naturalHeight || 1;
      const aspect = w / h;
      resolve({
        url,
        uploadedAt: "",
        aspect,
        orientation: aspect >= 1 ? "landscape" : "portrait",
      });
    };
    img.onerror = () => {
      resolve({
        url,
        uploadedAt: "",
        aspect: 0.41,
        orientation: "portrait",
      });
    };
    img.src = url;
  });
}

/** Pad until the track is long enough to fill wide screens without gaps. */
function buildSequence(items: OrientedItem[], minCount: number): OrientedItem[] {
  if (items.length === 0) return [];
  let seq = [...items];
  while (seq.length < minCount) {
    seq = [...seq, ...items];
  }
  return seq;
}

function MarqueeRow({
  items,
  direction,
  kind,
  compact = false,
}: {
  items: OrientedItem[];
  direction: "left" | "right";
  kind: "portrait" | "landscape";
  compact?: boolean;
}) {
  // Portrait cards are narrow — need many copies so the loop never shows empty green
  const minCount = kind === "portrait" ? 28 : 14;
  const sequence = useMemo(
    () => buildSequence(items, minCount),
    [items, minCount]
  );

  if (items.length === 0) return null;

  const duration = kind === "portrait" ? 65 : 75;
  const anim = direction === "left" ? "marquee-left" : "marquee-right";

  const heightCss =
    kind === "portrait"
      ? compact
        ? "min(36vh, 20rem)"
        : "min(42vh, 24rem)"
      : compact
        ? "min(16vh, 9.5rem)"
        : "min(18vh, 11rem)";

  const gapClass = "gap-4 sm:gap-5";
  // Match gap so the seam between duplicated halves is invisible
  const seamPad = "pr-4 sm:pr-5";

  const cards = (keyPrefix: string) =>
    sequence.map((item, i) => (
      <div
        key={`${keyPrefix}-${item.url}-${i}`}
        className="shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border border-feu-gold/40 shadow-[0_12px_36px_rgba(0,0,0,0.5)] bg-feu-cream/5 ring-1 ring-white/10"
        style={{
          height: heightCss,
          width: `calc(${heightCss} * ${item.aspect})`,
        }}
      >
        <img
          src={item.url}
          alt=""
          draggable={false}
          className="w-full h-full object-contain"
        />
      </div>
    ));

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20"
        style={{
          background: "linear-gradient(to right, #052E17 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20"
        style={{
          background: "linear-gradient(to left, #052E17 0%, transparent 100%)",
        }}
      />

      <div
        className="flex w-max items-center will-change-transform"
        style={{
          animation: `${anim} ${duration}s linear infinite`,
        }}
      >
        {/* Two identical halves — translateX(-50%) loops with no jump */}
        <div className={`flex items-center ${gapClass} ${seamPad}`}>
          {cards("a")}
        </div>
        <div className={`flex items-center ${gapClass} ${seamPad}`} aria-hidden>
          {cards("b")}
        </div>
      </div>
    </div>
  );
}

function ShowcaseBand({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="shrink-0 space-y-2">
      <div className="flex items-center gap-3 px-4 sm:px-8">
        <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.28em] text-feu-gold/55 uppercase shrink-0">
          {label}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-feu-gold/35 to-transparent" />
      </div>
      {children}
    </section>
  );
}

export default function IdleShowcase({ onDismiss }: Props) {
  const [oriented, setOriented] = useState<OrientedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = (await res.json()) as { items?: GalleryItem[] };
        const list = data.items ?? [];
        const probed = await Promise.all(
          list.map(async (item) => {
            const o = await probeOrientation(item.url);
            return { ...o, uploadedAt: item.uploadedAt };
          })
        );
        if (!cancelled) setOriented(probed);
      } catch {
        if (!cancelled) setOriented([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const portraits = oriented.filter((i) => i.orientation === "portrait");
  const landscapes = oriented.filter((i) => i.orientation === "landscape");
  const hasAny = oriented.length > 0;
  const hasBoth = portraits.length > 0 && landscapes.length > 0;

  function handleStart() {
    playClick();
    onDismiss();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleStart}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleStart();
        }
      }}
      className="fixed inset-0 z-50 flex flex-col cursor-pointer overflow-hidden outline-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0E6B34 0%, #052E17 45%, #02140c 100%)",
      }}
      aria-label="Tap to start photobooth"
    >
      <BrandLogos size="md" layout="split" className="!z-[60]" />

      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #FFC20E 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[45vh] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,194,14,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 pt-4 sm:pt-5 pb-4 sm:pb-5 gap-3 sm:gap-4">
        <header className="text-center px-20 sm:px-28 shrink-0 animate-fade-up">
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-feu-gold/70 uppercase mb-1.5">
            FEU Roosevelt · IT Department
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-feu-cream tracking-tight">
            Photobooth <span className="text-feu-gold">Showcase</span>
          </h1>
          {hasAny && (
            <p className="mt-1.5 font-body text-sm text-feu-cream/50 max-w-md mx-auto">
              Recent strips rolling by — tap anywhere to join in
            </p>
          )}
        </header>

        <div className="flex-1 min-h-0 flex flex-col justify-center gap-4 sm:gap-5 overflow-hidden">
          {loaded && !hasAny && (
            <div className="text-center space-y-3 px-6">
              <p className="font-display font-bold text-2xl text-feu-cream">
                Ready when you are
              </p>
              <p className="font-body text-feu-cream/60 text-base max-w-md mx-auto">
                Be the first strip on the wall — tap anywhere to start.
              </p>
            </div>
          )}

          {hasAny && (
            <>
              {portraits.length > 0 && (
                <ShowcaseBand label="Portrait strips">
                  <MarqueeRow
                    items={portraits}
                    direction="left"
                    kind="portrait"
                    compact={hasBoth}
                  />
                </ShowcaseBand>
              )}

              {landscapes.length > 0 && (
                <ShowcaseBand label="Landscape strips">
                  <MarqueeRow
                    items={landscapes}
                    direction="right"
                    kind="landscape"
                    compact={hasBoth}
                  />
                </ShowcaseBand>
              )}

              {portraits.length > 0 && landscapes.length === 0 && (
                <ShowcaseBand label="More portraits">
                  <MarqueeRow
                    items={portraits}
                    direction="right"
                    kind="portrait"
                    compact
                  />
                </ShowcaseBand>
              )}
              {landscapes.length > 0 && portraits.length === 0 && (
                <ShowcaseBand label="More landscapes">
                  <MarqueeRow
                    items={landscapes}
                    direction="left"
                    kind="landscape"
                    compact
                  />
                </ShowcaseBand>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 flex justify-center px-4">
          <span className="btn-gold pointer-events-none inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg shadow-gold animate-pulse">
            Tap anywhere to start
          </span>
        </div>
      </div>
    </div>
  );
}
