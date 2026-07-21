"use client";

import { BorderStyle } from "@/lib/borders";
import { FilterId, getFilterCss } from "@/lib/filters";
import { TemplateConfig, getCellRects } from "@/lib/types";
import { playNav } from "@/lib/sounds";

interface Props {
  template: TemplateConfig;
  shots: string[];
  border?: BorderStyle;
  filterId?: FilterId;
  variant?: "compact" | "sidebar";
  /** When set, shows prev/next border controls around the preview */
  onBorderPrev?: () => void;
  onBorderNext?: () => void;
  borderNavDisabled?: boolean;
}

function NavArrow({
  dir,
  onClick,
  disabled,
  label,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        playNav();
        onClick();
      }}
      className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-feu-greenDark text-feu-gold shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        {dir === "prev" ? (
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

export default function TemplatePreview({
  template,
  shots,
  border,
  filterId = "none",
  variant = "compact",
  onBorderPrev,
  onBorderNext,
  borderNavDisabled,
}: Props) {
  const rects = getCellRects(template);
  const accentColor = border?.accent ?? "#FFC20E";
  const primaryColor = border?.primary ?? "#0E6B34";
  const creamBg = border?.cream ?? "#FAF6EC";
  const filterCss = getFilterCss(filterId);
  const borderNav = Boolean(onBorderPrev && onBorderNext);

  const shotCells = (
    <div
      className="relative w-full flex-1 min-h-0 mx-auto"
      style={
        variant === "sidebar"
          ? {
              aspectRatio:
                (template.totalW - template.pad * 2) /
                (template.totalH - template.headerH - template.footerH - template.pad * 2),
              maxHeight: "100%",
            }
          : undefined
      }
    >
      {variant === "sidebar" ? (
        rects.map((r, i) => {
          const shot = shots[i];
          const contentW = template.totalW - template.pad * 2;
          const contentH =
            template.totalH - template.headerH - template.footerH - template.pad * 2;
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
                <img
                  src={shot}
                  alt={`Shot ${i + 1}`}
                  className="w-full h-full object-cover"
                  style={{ filter: filterCss }}
                />
              ) : (
                <span className="font-mono text-[10px]" style={{ color: `${primaryColor}66` }}>
                  {i + 1}
                </span>
              )}
            </div>
          );
        })
      ) : template.layout === "grid-2x2" ? (
        <div
          className="grid grid-cols-2 gap-1.5 flex-1 max-w-[11rem] sm:max-w-[13rem] mx-auto"
          style={{ aspectRatio: 1 }}
        >
          {rects.map((_, i) => {
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
                  <img
                    src={shot}
                    alt={`Shot ${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ filter: filterCss }}
                  />
                ) : (
                  <span className="font-mono text-[9px]" style={{ color: `${primaryColor}66` }}>
                    {i + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
          {rects.map((r, i) => {
            const shot = shots[i];
            const aspect = r.w / r.h;
            const wide = template.totalW > template.totalH;
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
                  <img
                    src={shot}
                    alt={`Shot ${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ filter: filterCss }}
                  />
                ) : (
                  <span className="font-mono text-[9px]" style={{ color: `${primaryColor}66` }}>
                    {i + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (variant === "sidebar") {
    return (
      <div
        className="rounded-2xl border-2 shadow-panel p-3 sm:p-4 w-full h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: creamBg, borderColor: `${accentColor}80` }}
      >
        <p
          className="text-center font-display font-bold text-[11px] tracking-widest uppercase mb-1 shrink-0"
          style={{ color: `${primaryColor}b3` }}
        >
          {borderNav ? "Border" : "Your strip"}
        </p>
        {borderNav && border && (
          <p
            className="text-center font-display font-bold text-sm mb-2 shrink-0 truncate px-1"
            style={{ color: primaryColor }}
          >
            {border.label}
          </p>
        )}
        <div className={`flex items-center gap-2 flex-1 min-h-0 ${borderNav ? "" : ""}`}>
          {borderNav && (
            <NavArrow
              dir="prev"
              label="Previous border"
              disabled={borderNavDisabled}
              onClick={onBorderPrev!}
            />
          )}
          <div className="flex-1 min-w-0 h-full flex flex-col">{shotCells}</div>
          {borderNav && (
            <NavArrow
              dir="next"
              label="Next border"
              disabled={borderNavDisabled}
              onClick={onBorderNext!}
            />
          )}
        </div>
        {borderNav && (
          <p
            className="text-center font-mono text-[9px] tracking-wider uppercase mt-2 shrink-0"
            style={{ color: `${primaryColor}80` }}
          >
            ← swipe borders →
          </p>
        )}
      </div>
    );
  }

  const wide = template.totalW > template.totalH;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border-2 shadow-sm w-full ${
        wide ? "px-3 py-3" : "px-2 py-2"
      }`}
      style={{ backgroundColor: creamBg, borderColor: `${accentColor}80` }}
    >
      {borderNav ? (
        <NavArrow
          dir="prev"
          label="Previous border"
          disabled={borderNavDisabled}
          onClick={onBorderPrev!}
        />
      ) : (
        <span
          className="text-[10px] font-mono tracking-widest uppercase shrink-0"
          style={{ color: `${primaryColor}99` }}
        >
          Strip
        </span>
      )}
      <div className="flex-1 min-w-0 flex flex-col items-center gap-1">
        {borderNav && border && (
          <p
            className="font-display font-bold text-xs truncate max-w-full"
            style={{ color: primaryColor }}
          >
            {border.label}
          </p>
        )}
        {shotCells}
      </div>
      {borderNav ? (
        <NavArrow
          dir="next"
          label="Next border"
          disabled={borderNavDisabled}
          onClick={onBorderNext!}
        />
      ) : null}
    </div>
  );
}
