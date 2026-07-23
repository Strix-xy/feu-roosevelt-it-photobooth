"use client";

import { BorderStyle } from "@/lib/borders";
import { FilterId, getFilterCss } from "@/lib/filters";
import { TemplateConfig, getCellRects, isWideTemplate } from "@/lib/types";
import { playClick, playConfirm } from "@/lib/sounds";

interface Props {
  template: TemplateConfig;
  shots: string[];
  border: BorderStyle;
  filterId?: FilterId;
  onRetake: (index: number) => void;
  onKeepAll: () => void;
  composing?: boolean;
}

export default function ShotConfirm({
  template,
  shots,
  border,
  filterId = "none",
  onRetake,
  onKeepAll,
  composing,
}: Props) {
  const rects = getCellRects(template);
  const wide = isWideTemplate(template);
  const filterCss = getFilterCss(filterId);
  const contentW = template.totalW - template.pad * 2;
  const contentH =
    template.totalH - template.headerH - template.footerH - template.pad * 2;
  const aspect = contentW / contentH;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl py-4">
      <div className="text-center space-y-2 px-4">
        <p className="font-mono text-[10px] tracking-[0.28em] text-feu-green/55 uppercase">
          Almost there
        </p>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-feu-greenDark tracking-tight">
          Looking good?
        </h2>
        <p className="font-body text-sm text-feu-ink/60 max-w-md mx-auto">
          Retake any shot you don&apos;t like, then keep all to finish your strip.
        </p>
      </div>

      <div
        className="relative mx-auto rounded-2xl border-2 shadow-panel p-3 sm:p-4 ring-1 ring-black/5"
        style={{
          backgroundColor: border.cream,
          borderColor: `${border.accent}80`,
          aspectRatio: aspect,
          ...(wide
            ? {
                width: "min(100%, 40rem)",
                maxHeight: "min(56vh, 28rem)",
              }
            : {
                height: "min(72vh, 38rem)",
                width: "auto",
                maxWidth: "min(92vw, 18rem)",
              }),
        }}
      >
        {rects.map((r, i) => {
          const shot = shots[i];
          return (
            <div
              key={i}
              className="absolute rounded-lg overflow-hidden group"
              style={{
                left: `${((r.x - template.pad) / contentW) * 100}%`,
                top: `${((r.y - template.headerH - template.pad) / contentH) * 100}%`,
                width: `${(r.w / contentW) * 100}%`,
                height: `${(r.h / contentH) * 100}%`,
                border: `2px solid ${border.accent}`,
              }}
            >
              {shot ? (
                <img
                  src={shot}
                  alt={`Shot ${i + 1}`}
                  className="w-full h-full object-cover"
                  style={{ filter: filterCss }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-white/60"
                  style={{ color: `${border.primary}66` }}
                >
                  <span className="font-mono text-sm">{i + 1}</span>
                </div>
              )}
              <button
                type="button"
                disabled={composing}
                onClick={() => {
                  playClick();
                  onRetake(i);
                }}
                className="absolute inset-x-0 bottom-0 py-1.5 sm:py-2 bg-feu-greenDark/85 text-feu-gold font-display font-bold text-xs sm:text-sm tracking-wide opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                Retake
              </button>
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-feu-greenDark/70 text-feu-gold font-mono text-[10px]">
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={composing || shots.length < template.shotCount}
        onClick={() => {
          playConfirm();
          onKeepAll();
        }}
        className="btn-gold px-10 py-4 rounded-2xl text-lg"
      >
        {composing ? "Composing…" : "Keep all"}
      </button>
    </div>
  );
}
