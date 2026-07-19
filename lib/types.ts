export type TemplateId = "portrait" | "landscape";
export type LayoutKind = "stack" | "row" | "featured" | "featured-row";

export interface TemplateConfig {
  id: TemplateId;
  label: string;
  description: string;
  shotCount: number;
  layout: LayoutKind;
  /** overall composed-strip canvas size, in px */
  totalW: number;
  totalH: number;
  headerH: number;
  footerH: number;
  pad: number;
  gap: number;
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  portrait: {
    id: "portrait",
    label: "Portrait strip",
    description: "Classic vertical strip — 3 shots stacked top to bottom.",
    shotCount: 3,
    layout: "stack",
    totalW: 820,
    totalH: 2000,
    headerH: 116,
    footerH: 100,
    pad: 32,
    gap: 22,
  },
  landscape: {
    id: "landscape",
    label: "Landscape strip",
    description: "1 big shot on the left, 2 shots stacked on the right — every shot stays widescreen.",
    shotCount: 3,
    layout: "featured-row",
    totalW: 1600,
    totalH: 900,
    headerH: 96,
    footerH: 82,
    pad: 28,
    gap: 18,
  },
};

export interface CellRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The rectangle each shot occupies within the composed strip, in canvas
 * coordinates. Both the live camera preview and the final capture crop use
 * this, so reshaping a template here reshapes everything consistently.
 */
export function getCellRects(t: TemplateConfig): CellRect[] {
  const contentW = t.totalW - t.pad * 2;
  const contentH = t.totalH - t.headerH - t.footerH - t.pad * 2;
  const originX = t.pad;
  const originY = t.headerH + t.pad;

  if (t.layout === "row") {
    const w = (contentW - t.gap * (t.shotCount - 1)) / t.shotCount;
    return Array.from({ length: t.shotCount }, (_, i) => ({
      x: originX + i * (w + t.gap),
      y: originY,
      w,
      h: contentH,
    }));
  }

  if (t.layout === "featured") {
    // big cell on top, 2 small cells side by side below — every cell keeps
    // a portrait-friendly aspect ratio
    const bigH = (contentH - t.gap) * 0.6;
    const smallH = contentH - t.gap - bigH;
    const smallW = (contentW - t.gap) / 2;
    return [
      { x: originX, y: originY, w: contentW, h: bigH },
      { x: originX, y: originY + bigH + t.gap, w: smallW, h: smallH },
      { x: originX + smallW + t.gap, y: originY + bigH + t.gap, w: smallW, h: smallH },
    ];
  }

  if (t.layout === "featured-row") {
    // big cell on the left, 2 cells stacked on the right — every cell keeps
    // a landscape (wide) aspect ratio, unlike an even 3-column split
    const bigW = (contentW - t.gap) * 0.62;
    const smallW = contentW - t.gap - bigW;
    const smallH = (contentH - t.gap) / 2;
    return [
      { x: originX, y: originY, w: bigW, h: contentH },
      { x: originX + bigW + t.gap, y: originY, w: smallW, h: smallH },
      { x: originX + bigW + t.gap, y: originY + smallH + t.gap, w: smallW, h: smallH },
    ];
  }

  // "stack" — uniform vertical
  const h = (contentH - t.gap * (t.shotCount - 1)) / t.shotCount;
  return Array.from({ length: t.shotCount }, (_, i) => ({
    x: originX,
    y: originY + i * (h + t.gap),
    w: contentW,
    h,
  }));
}

export type Stage = "start" | "template" | "camera" | "review";
