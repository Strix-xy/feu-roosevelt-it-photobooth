"use client";

import { BorderStyle } from "@/lib/borders";
import { TemplateConfig, getCellRects } from "@/lib/types";

interface Props {
  template: TemplateConfig;
  shots: string[];
  border?: BorderStyle;
  variant?: "compact" | "sidebar";
}

export default function TemplatePreview({
  template,
  shots,
  border,
  variant = "compact",
}: Props) {
  const rects = getCellRects(template);
  const accentColor = border?.accent ?? "#FFC20E";
  const primaryColor = border?.primary ?? "#0E6B34";
  const creamBg = border?.cream ?? "#FAF6EC";

  if (variant === "sidebar") {
    const contentW = template.totalW - template.pad * 2;
    const contentH = template.totalH - template.headerH - template.footerH - template.pad * 2;
    return (
      <div
        className="rounded-2xl border-2 shadow-panel p-3 sm:p-4 w-full h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: creamBg, borderColor: `${accentColor}80` }}
      >
        <p
          className="text-center font-display font-bold text-[11px] tracking-widest uppercase mb-2 shrink-0"
          style={{ color: `${primaryColor}b3` }}
        >
          Your strip
        </p>
        <div
          className="relative w-full flex-1 min-h-0 mx-auto"
          style={{ aspectRatio: contentW / contentH, maxHeight: "100%" }}
        >
          {rects.map((r, i) => {
            const shot = shots[i];
            return (
              <div
                key={i}
                className={`absolute rounded-lg overflow-hidden ${
                  shot
                    ? "shadow-sm animate-pop-in"
                    : "border-2 border-dashed bg-white/60 flex items-center justify-center"
                }`}
                style={{
                  left: `${((r.x - template.pad) / contentW) * 100}%`,
                  top: `${((r.y - template.headerH - template.pad) / contentH) * 100}%`,
                  width: `${(r.w / contentW) * 100}%`,
                  height: `${(r.h / contentH) * 100}%`,
                  borderColor: shot ? accentColor : `${primaryColor}4d`,
                  borderWidth: shot ? 2 : undefined,
                }}
              >
                {shot ? (
                  <img src={shot} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-[10px]" style={{ color: `${primaryColor}66` }}>
                    {i + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const wide = template.totalW > template.totalH;

  if (template.layout === "grid-2x2") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border-2 shadow-sm w-full px-4 py-3"
        style={{ backgroundColor: creamBg, borderColor: `${accentColor}80` }}
      >
        <span
          className="text-[10px] font-mono tracking-widest uppercase shrink-0"
          style={{ color: `${primaryColor}99` }}
        >
          Strip
        </span>
        <div
          className="grid grid-cols-2 gap-1.5 flex-1 max-w-[11rem] sm:max-w-[13rem] mx-auto"
          style={{ aspectRatio: 1 }}
        >
          {rects.map((r, i) => {
            const shot = shots[i];
            return (
              <div
                key={i}
                className={`rounded-md overflow-hidden ${
                  shot
                    ? "shadow-sm animate-pop-in"
                    : "border-2 border-dashed bg-white/60 flex items-center justify-center"
                }`}
                style={{
                  borderColor: shot ? accentColor : `${primaryColor}4d`,
                  borderWidth: shot ? 2 : undefined,
                }}
              >
                {shot ? (
                  <img src={shot} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-[9px]" style={{ color: `${primaryColor}66` }}>
                    {i + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 shadow-sm w-full ${
        wide ? "px-4 py-3" : "px-3 py-2"
      }`}
      style={{ backgroundColor: creamBg, borderColor: `${accentColor}80` }}
    >
      <span
        className="text-[10px] font-mono tracking-widest uppercase shrink-0"
        style={{ color: `${primaryColor}99` }}
      >
        Strip
      </span>
      <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
        {rects.map((r, i) => {
          const shot = shots[i];
          const aspect = r.w / r.h;
          return (
            <div
              key={i}
              className={`rounded-md overflow-hidden shrink-0 ${
                shot
                  ? "shadow-sm animate-pop-in"
                  : "border-2 border-dashed bg-white/60 flex items-center justify-center"
              }`}
              style={{
                aspectRatio: aspect,
                height: wide ? "5rem" : "3.75rem",
                borderColor: shot ? accentColor : `${primaryColor}4d`,
                borderWidth: shot ? 2 : undefined,
              }}
            >
              {shot ? (
                <img src={shot} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-[9px]" style={{ color: `${primaryColor}66` }}>
                  {i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
