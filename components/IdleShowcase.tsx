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

function MarqueeRow({
  items,
  direction,
  kind,
}: {
  items: OrientedItem[];
  direction: "left" | "right";
  kind: "portrait" | "landscape";
}) {
  // One padded sequence, rendered twice so translateX(-50%) loops cleanly
  const sequence = useMemo(() => {
    if (items.length === 0) return [];
    let seq = [...items];
    while (seq.length < 8) seq = [...seq, ...items];
    return seq;
  }, [items]);

  if (items.length === 0) return null;

  const duration = kind === "portrait" ? 55 : 70;
  const anim =
    direction === "left" ? "marquee-left" : "marquee-right";

  const cards = (keyPrefix: string) =>
    sequence.map((item, i) => (
      <div
        key={`${keyPrefix}-${item.url}-${i}`}
        className="shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border border-feu-gold/30 shadow-[0_12px_40px_rgba(0,0,0,0.4)] bg-feu-greenDark/40"
        style={
          kind === "portrait"
            ? {
                height: "min(42vh, 22rem)",
                width: `calc(min(42vh, 22rem) * ${item.aspect})`,
              }
            : {
                height: "min(22vh, 11rem)",
                width: `calc(min(22vh, 11rem) * ${item.aspect})`,
              }
        }
      >
        <img
          src={item.url}
          alt=""
          draggable={false}
          className="w-full h-full object-cover"
        />
      </div>
    ));

  return (
    <div className="relative w-full overflow-hidden py-2">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28"
        style={{
          background:
            "linear-gradient(to right, #052E17 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28"
        style={{
          background:
            "linear-gradient(to left, #052E17 0%, transparent 100%)",
        }}
      />

      <div
        className="flex w-max will-change-transform"
        style={{
          animation: `${anim} ${duration}s linear infinite`,
        }}
      >
        <div className="flex gap-5 sm:gap-7 pr-5 sm:pr-7">{cards("a")}</div>
        <div className="flex gap-5 sm:gap-7 pr-5 sm:pr-7" aria-hidden>
          {cards("b")}
        </div>
      </div>
    </div>
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

  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        onDismiss();
      }}
      className="fixed inset-0 z-50 flex flex-col cursor-pointer border-0 p-0 text-left overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0E6B34 0%, #052E17 45%, #02140c 100%)",
      }}
      aria-label="Tap to start photobooth"
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #FFC20E 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft gold glow behind marquees */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,194,14,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 justify-between py-6 sm:py-8 gap-4">
        <header className="text-center px-4 shrink-0 animate-fade-up space-y-3">
          <BrandLogos size="md" />
          <div>
            <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-feu-gold/70 uppercase mb-2">
              FEU Roosevelt · IT Department
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-feu-cream tracking-tight">
              Photobooth <span className="text-feu-gold">Showcase</span>
            </h1>
            {hasAny && (
              <p className="mt-3 font-body text-sm text-feu-cream/50 max-w-md mx-auto">
                Recent strips rolling by — tap anywhere to join in
              </p>
            )}
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col justify-center gap-5 sm:gap-7">
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
              {/* Portrait row — tall strips, scroll left */}
              {portraits.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="px-6 sm:px-10 font-mono text-[9px] tracking-[0.3em] text-feu-gold/45 uppercase">
                    Portrait strips
                  </p>
                  <MarqueeRow
                    items={portraits}
                    direction="left"
                    kind="portrait"
                  />
                </div>
              ) : null}

              {/* Landscape / wide row — scroll right */}
              {landscapes.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="px-6 sm:px-10 font-mono text-[9px] tracking-[0.3em] text-feu-gold/45 uppercase">
                    Landscape strips
                  </p>
                  <MarqueeRow
                    items={landscapes}
                    direction="right"
                    kind="landscape"
                  />
                </div>
              ) : null}

              {/* If only one orientation, still fill space with a second reverse pass of the same set for denser vibe */}
              {portraits.length > 0 && landscapes.length === 0 && (
                <MarqueeRow
                  items={portraits}
                  direction="right"
                  kind="portrait"
                />
              )}
              {landscapes.length > 0 && portraits.length === 0 && (
                <MarqueeRow
                  items={landscapes}
                  direction="left"
                  kind="landscape"
                />
              )}
            </>
          )}
        </div>

        <div className="shrink-0 text-center pb-2 space-y-2">
          <span className="inline-flex mx-auto h-px w-16 bg-gradient-to-r from-transparent via-feu-gold/60 to-transparent" />
          <p className="font-display font-bold text-feu-gold text-lg sm:text-xl animate-pulse">
            Tap anywhere to start
          </p>
        </div>
      </div>
    </button>
  );
}
