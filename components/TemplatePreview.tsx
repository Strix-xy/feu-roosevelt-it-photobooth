"use client";

import { TemplateConfig, getCellRects } from "@/lib/types";

interface Props {
  template: TemplateConfig;
  shots: string[];
  variant?: "compact" | "sidebar";
}

export default function TemplatePreview({ template, shots, variant = "compact" }: Props) {
  const rects = getCellRects(template);

  if (variant === "sidebar") {
    const contentW = template.totalW - template.pad * 2;
    const contentH = template.totalH - template.headerH - template.footerH - template.pad * 2;
    return (
      <div className="bg-feu-cream rounded-2xl border-2 border-feu-gold/50 shadow-panel p-3 sm:p-4 w-full max-h-full overflow-hidden">
        <p className="text-center font-display font-bold text-[11px] tracking-widest text-feu-greenDark/70 uppercase mb-2">
          Your strip
        </p>
        <div className="relative w-full" style={{ aspectRatio: contentW / contentH }}>
          {rects.map((r, i) => {
            const shot = shots[i];
            return (
              <div
                key={i}
                className={`absolute rounded-lg overflow-hidden ${
                  shot
                    ? "border-2 border-feu-gold shadow-sm animate-pop-in"
                    : "border-2 border-dashed border-feu-green/30 bg-white/60 flex items-center justify-center"
                }`}
                style={{
                  left: `${((r.x - template.pad) / contentW) * 100}%`,
                  top: `${((r.y - template.headerH - template.pad) / contentH) * 100}%`,
                  width: `${(r.w / contentW) * 100}%`,
                  height: `${(r.h / contentH) * 100}%`,
                }}
              >
                {shot ? (
                  <img src={shot} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-[10px] text-feu-green/40">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const isLandscape = template.id === "landscape";

  return (
    <div className={`flex items-center gap-3 bg-feu-cream rounded-xl border-2 border-feu-gold/50 shadow-sm w-full ${isLandscape ? "px-4 py-3" : "px-3 py-2"}`}>
      <span className="text-[10px] font-mono tracking-widest text-feu-greenDark/60 uppercase shrink-0">
        Strip
      </span>
      <div className="flex items-center gap-2 flex-1 justify-center">
        {rects.map((r, i) => {
          const shot = shots[i];
          const aspect = r.w / r.h;
          return (
            <div
              key={i}
              style={{ aspectRatio: aspect, height: isLandscape ? "5rem" : "3.75rem" }}
              className={`rounded-md overflow-hidden shrink-0 ${
                shot
                  ? "border-2 border-feu-gold shadow-sm animate-pop-in"
                  : "border-2 border-dashed border-feu-green/30 bg-white/60 flex items-center justify-center"
              }`}
            >
              {shot ? (
                <img src={shot} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-[9px] text-feu-green/40">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
