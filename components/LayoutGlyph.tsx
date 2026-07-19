"use client";

import { TemplateConfig, getCellRects } from "@/lib/types";

interface Props {
  template: TemplateConfig;
  selected: boolean;
}

export default function LayoutGlyph({ template, selected }: Props) {
  const rects = getCellRects(template);
  const contentW = template.totalW - template.pad * 2;
  const contentH = template.totalH - template.headerH - template.footerH - template.pad * 2;
  const boxAspect = contentW / contentH;

  const base = boxAspect >= 1 ? 128 : 112;

  return (
    <div
      className="relative"
      style={{
        width: boxAspect >= 1 ? `${base}px` : `${base * boxAspect}px`,
        height: boxAspect >= 1 ? `${base / boxAspect}px` : `${base}px`,
      }}
    >
      {rects.map((r, i) => (
        <div
          key={i}
          className={`absolute rounded-md border-2 ${
            selected ? "border-feu-gold bg-feu-gold/25" : "border-feu-green/50 bg-feu-green/10"
          }`}
          style={{
            left: `${((r.x - template.pad) / contentW) * 100}%`,
            top: `${((r.y - template.headerH - template.pad) / contentH) * 100}%`,
            width: `${(r.w / contentW) * 100}%`,
            height: `${(r.h / contentH) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
