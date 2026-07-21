export type FilterId = "none" | "mono" | "sepia" | "warm" | "cool" | "fade";

export interface FilterStyle {
  id: FilterId;
  label: string;
  /** CSS filter string for live preview (<img> / <video>) and canvas.ctx.filter */
  css: string;
}

export const FILTERS: Record<FilterId, FilterStyle> = {
  none: { id: "none", label: "Original", css: "none" },
  mono: { id: "mono", label: "Mono", css: "grayscale(1) contrast(1.05)" },
  sepia: { id: "sepia", label: "Sepia", css: "sepia(0.85) contrast(1.05)" },
  warm: {
    id: "warm",
    label: "Warm",
    css: "sepia(0.25) saturate(1.2) brightness(1.05) hue-rotate(-8deg)",
  },
  cool: {
    id: "cool",
    label: "Cool",
    css: "saturate(0.9) brightness(1.02) hue-rotate(18deg) contrast(1.05)",
  },
  fade: {
    id: "fade",
    label: "Fade",
    css: "contrast(0.88) brightness(1.08) saturate(0.75)",
  },
};

export const FILTER_LIST = Object.values(FILTERS);
export const DEFAULT_FILTER: FilterId = "none";

export function getFilterCss(id: FilterId | undefined): string {
  return FILTERS[id ?? "none"]?.css ?? "none";
}

/**
 * Returns a CanvasImageSource with the filter baked in.
 * Identity for `none` (returns the original image).
 */
export function applyFilterToImage(
  img: HTMLImageElement,
  filterId: FilterId | undefined
): CanvasImageSource {
  const id = filterId ?? "none";
  if (id === "none") return img;

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = getFilterCss(id);
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = "none";
  return canvas;
}
