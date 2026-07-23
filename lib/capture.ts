import { TemplateConfig, getCellRects } from "./types";
import { BorderDesign, BorderStyle, DEFAULT_FOOTER } from "./borders";
import { FilterId, applyFilterToImage } from "./filters";

export interface ComposeOptions {
  border?: BorderStyle;
  footerText?: string;
  filterId?: FilterId;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Textures ───────────────────────────────────────────────────────────────

function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  spacing = 26
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let gy = y; gy < y + h; gy += spacing) {
    for (let gx = x; gx < x + w; gx += spacing) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawPolkaDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  const spacing = 22;
  for (let gy = y + 8; gy < y + h; gy += spacing) {
    for (let gx = x + 8; gx < x + w; gx += spacing) {
      ctx.beginPath();
      ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCrosshatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  const step = 14;
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDiagonalStripes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  const step = 28;
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h * 0.6, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBubbles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  const bubbles: [number, number, number][] = [
    [0.12, 0.15, 8], [0.88, 0.22, 12], [0.25, 0.45, 6],
    [0.72, 0.55, 9], [0.45, 0.78, 11], [0.08, 0.82, 5],
    [0.92, 0.72, 7], [0.55, 0.28, 5], [0.35, 0.62, 8],
    [0.18, 0.32, 4], [0.62, 0.12, 6], [0.78, 0.88, 5],
  ];
  for (const [fx, fy, r] of bubbles) {
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(x + w * fx, y + h * fy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.12;
    ctx.fill();
  }
  ctx.restore();
}

function drawConstellationGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lineColor: string,
  starColor: string
) {
  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  const step = 28;
  for (let gx = x + step; gx < x + w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y + step; gy < y + h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  ctx.fillStyle = starColor;
  const stars: [number, number, number][] = [
    [0.14, 0.18, 2.2], [0.32, 0.12, 1.6], [0.48, 0.22, 2.8],
    [0.68, 0.14, 1.8], [0.86, 0.2, 2.4], [0.22, 0.38, 1.5],
    [0.58, 0.42, 2], [0.78, 0.36, 1.7], [0.12, 0.62, 2.1],
    [0.4, 0.58, 1.4], [0.72, 0.66, 2.5], [0.9, 0.55, 1.6],
    [0.28, 0.82, 2], [0.52, 0.78, 1.5], [0.84, 0.86, 2.2],
  ];
  for (const [fx, fy, r] of stars) {
    ctx.beginPath();
    ctx.arc(x + w * fx, y + h * fy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // a few thin constellation links
  ctx.strokeStyle = starColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.45;
  const links: [number, number, number, number][] = [
    [0.14, 0.18, 0.32, 0.12],
    [0.32, 0.12, 0.48, 0.22],
    [0.48, 0.22, 0.68, 0.14],
    [0.58, 0.42, 0.72, 0.66],
    [0.28, 0.82, 0.52, 0.78],
  ];
  for (const [x1, y1, x2, y2] of links) {
    ctx.beginPath();
    ctx.moveTo(x + w * x1, y + h * y1);
    ctx.lineTo(x + w * x2, y + h * y2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCircuitTraces(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  const traces: [number, number, number, number][] = [
    [0.08, 0.2, 0.22, 0.2],
    [0.22, 0.2, 0.22, 0.34],
    [0.78, 0.18, 0.92, 0.18],
    [0.78, 0.18, 0.78, 0.3],
    [0.1, 0.72, 0.1, 0.88],
    [0.1, 0.88, 0.26, 0.88],
    [0.74, 0.7, 0.9, 0.7],
    [0.9, 0.7, 0.9, 0.86],
  ];
  for (const [x1, y1, x2, y2] of traces) {
    ctx.beginPath();
    ctx.moveTo(x + w * x1, y + h * y1);
    ctx.lineTo(x + w * x2, y + h * y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w * x1, y + h * y1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w * x2, y + h * y2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWaveLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string,
  amplitude = 5,
  wavelength = 36
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let px = 0; px <= w; px += 2) {
    const wy = y + Math.sin((px / wavelength) * Math.PI * 2) * amplitude;
    if (px === 0) ctx.moveTo(x + px, wy);
    else ctx.lineTo(x + px, wy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string,
  stroke?: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }
  ctx.restore();
}

function drawPrismCorners(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  primary: string,
  accent: string
) {
  const inset = 14;
  const len = 26;
  const corners: [number, number, number, number][] = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - inset, 1, -1],
    [w - inset, h - inset, -1, -1],
  ];
  ctx.save();
  for (const [cx, cy, dx, dy] of corners) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(cx, cy + len * dy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + len * dx, cy);
    ctx.stroke();

    ctx.fillStyle = primary;
    ctx.fillRect(cx - 3, cy - 3, 6, 6);

    drawDiamond(ctx, cx + 14 * dx, cy + 14 * dy, 4, accent, primary);
  }
  ctx.restore();
}

function drawCrestEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  accent: string,
  primary: string
) {
  ctx.save();
  drawDiamond(ctx, cx, cy, 7, accent, primary);
  drawDiamond(ctx, cx, cy, 3.5, primary);
  ctx.restore();
}

// ─── Decorations ────────────────────────────────────────────────────────────

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accent: string,
  len = 30
) {
  const inset = 16;
  const corners: [number, number, number, number][] = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - inset, 1, -1],
    [w - inset, h - inset, -1, -1],
  ];
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + len * dy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + len * dx, cy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDiamondCorners(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accent: string,
  size = 12
) {
  const inset = 20;
  const pts: [number, number][] = [
    [inset, inset], [w - inset, inset],
    [inset, h - inset], [w - inset, h - inset],
  ];
  ctx.save();
  ctx.fillStyle = accent;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  for (const [cx, cy] of pts) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrnateFlourishes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accent: string
) {
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  const corners = [
    { x: 18, y: 18, sx: 1, sy: 1 },
    { x: w - 18, y: 18, sx: -1, sy: 1 },
    { x: 18, y: h - 18, sx: 1, sy: -1 },
    { x: w - 18, y: h - 18, sx: -1, sy: -1 },
  ];
  for (const c of corners) {
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + 28 * c.sy);
    ctx.quadraticCurveTo(c.x, c.y, c.x + 28 * c.sx, c.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c.x + 8 * c.sx, c.y + 8 * c.sy, 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStarDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accent: string
) {
  ctx.save();
  ctx.fillStyle = accent;
  const stars: [number, number, number][] = [[6, 6, 3], [22, 4, 2], [4, 20, 2]];
  for (const [dx, dy, r] of stars) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCircuitFlank(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  textHalfWidth: number,
  direction: 1 | -1,
  accent: string
) {
  const startX = centerX + direction * (textHalfWidth + 14);
  const endX = centerX + direction * (textHalfWidth + 70);
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(startX, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(endX, y, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTicketNotches(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.globalCompositeOperation = "destination-out";
  const notchR = 10;
  for (const f of [0.28, 0.5, 0.72]) {
    ctx.beginPath();
    ctx.arc(0, h * f, notchR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w, h * f, notchR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

// ─── Card shell ─────────────────────────────────────────────────────────────

function getCardRadius(design: BorderDesign): number {
  switch (design) {
    case "royal-crest": return 8;
    case "blush-glow": return 32;
    case "violet-clean": return 6;
    case "ocean-wave": return 24;
    default: return 28;
  }
}

function drawCardBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  border: BorderStyle
) {
  const r = getCardRadius(border.design);
  roundedRectPath(ctx, 0, 0, w, h, r);
  ctx.fillStyle = border.cream;
  ctx.fill();

  ctx.save();
  roundedRectPath(ctx, 0, 0, w, h, r);
  ctx.clip();

  switch (border.design) {
    case "feu-classic":
      drawDotGrid(ctx, 0, 0, w, h, border.dotGrid);
      drawCircuitTraces(ctx, 0, 0, w, h, hexToRgba(border.primary, 0.14));
      break;
    case "royal-crest":
      drawCrosshatch(ctx, 0, 0, w, h, hexToRgba(border.primary, 0.07));
      break;
    case "crimson-ornate":
      drawDiagonalStripes(ctx, 0, 0, w, h, hexToRgba(border.primary, 0.055));
      break;
    case "blush-glow":
      drawPolkaDots(ctx, 0, 0, w, h, hexToRgba(border.primary, 0.12));
      break;
    case "ocean-wave":
      drawBubbles(ctx, 0, 0, w, h, hexToRgba(border.primary, 0.28));
      break;
    case "violet-clean":
      drawConstellationGrid(
        ctx,
        0,
        0,
        w,
        h,
        hexToRgba(border.accent, 0.18),
        hexToRgba(border.primary, 0.28)
      );
      break;
  }
  ctx.restore();

  drawTicketNotches(ctx, w, h);
}

function drawCardHeader(
  ctx: CanvasRenderingContext2D,
  w: number,
  headerH: number,
  cardH: number,
  border: BorderStyle
) {
  const titleY = headerH * 0.42;
  const subY = headerH * 0.74;
  const headerText = "FEU ROOSEVELT";
  const subText = "ACES · ALLIANCE OF COMPUTING EDUCATION STUDENTS";

  ctx.save();
  const r = getCardRadius(border.design);
  roundedRectPath(ctx, 0, 0, w, cardH, r);
  ctx.clip();

  switch (border.design) {
    case "feu-classic":
      ctx.fillStyle = border.primaryDark;
      ctx.fillRect(0, 0, w, headerH);
      ctx.fillStyle = border.accent;
      ctx.fillRect(0, headerH - 4, w, 4);
      break;

    case "royal-crest": {
      ctx.fillStyle = border.primaryDark;
      ctx.fillRect(0, 0, w, headerH);
      ctx.strokeStyle = border.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(24, 12);
      ctx.lineTo(w - 24, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(24, headerH - 10);
      ctx.lineTo(w - 24, headerH - 10);
      ctx.stroke();
      drawCrestEmblem(ctx, w / 2, 12, border.accent, border.primary);
      drawCrestEmblem(ctx, w / 2, headerH - 10, border.accent, border.primary);
      break;
    }

    case "crimson-ornate": {
      ctx.fillStyle = border.primaryDark;
      ctx.fillRect(0, 0, w, headerH);
      // banner ribbon ends
      ctx.fillStyle = border.accent;
      ctx.beginPath();
      ctx.moveTo(0, headerH - 8);
      ctx.lineTo(20, headerH);
      ctx.lineTo(0, headerH);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w, headerH - 8);
      ctx.lineTo(w - 20, headerH);
      ctx.lineTo(w, headerH);
      ctx.closePath();
      ctx.fill();
      // gold crown rule under title area
      ctx.strokeStyle = hexToRgba(border.accent, 0.7);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(28, headerH - 14);
      ctx.lineTo(w - 28, headerH - 14);
      ctx.stroke();
      break;
    }

    case "blush-glow": {
      const grad = ctx.createLinearGradient(0, 0, w, headerH);
      grad.addColorStop(0, border.primaryDark);
      grad.addColorStop(0.55, hexToRgba(border.primary, 0.9));
      grad.addColorStop(1, hexToRgba(border.accent, 0.55));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, headerH);
      // soft rounded bottom edge
      ctx.fillStyle = border.cream;
      ctx.beginPath();
      ctx.ellipse(w / 2, headerH + 6, w * 0.52, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      drawStarDots(ctx, 18, 10, hexToRgba(border.accent, 0.85));
      drawStarDots(ctx, w - 42, 10, hexToRgba(border.accent, 0.85));
      break;
    }

    case "violet-clean": {
      const grad = ctx.createLinearGradient(0, 0, w, headerH);
      grad.addColorStop(0, border.primaryDark);
      grad.addColorStop(0.5, hexToRgba(border.primary, 0.95));
      grad.addColorStop(1, border.primaryDark);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, headerH);

      // constellation flecks in header
      ctx.fillStyle = hexToRgba(border.accent, 0.55);
      for (const [fx, fy, r] of [
        [0.1, 0.28, 1.6],
        [0.18, 0.55, 2.2],
        [0.82, 0.3, 1.8],
        [0.9, 0.58, 2],
        [0.28, 0.72, 1.4],
        [0.72, 0.7, 1.5],
      ] as const) {
        ctx.beginPath();
        ctx.arc(w * fx, headerH * fy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // prism rails
      ctx.strokeStyle = border.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, 10);
      ctx.lineTo(w - 20, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, headerH - 8);
      ctx.lineTo(w - 20, headerH - 8);
      ctx.stroke();
      drawDiamond(ctx, 28, headerH / 2, 5, border.accent, border.primary);
      drawDiamond(ctx, w - 28, headerH / 2, 5, border.accent, border.primary);
      break;
    }

    case "ocean-wave": {
      ctx.fillStyle = border.primaryDark;
      ctx.fillRect(0, 0, w, headerH);
      drawWaveLine(ctx, 20, headerH - 14, w - 40, hexToRgba(border.accent, 0.45), 3, 28);
      drawWaveLine(ctx, 20, headerH - 4, w - 40, border.accent, 4, 40);
      break;
    }
  }
  ctx.restore();

  // title
  ctx.textAlign = "center";
  ctx.fillStyle = border.accent;
  ctx.font = "700 28px Sora, Poppins, sans-serif";
  ctx.fillText(headerText, w / 2, titleY);

  if (border.design === "feu-classic") {
    const hw = ctx.measureText(headerText).width / 2;
    drawCircuitFlank(ctx, w / 2, titleY - 6, hw, 1, hexToRgba(border.accent, 0.65));
    drawCircuitFlank(ctx, w / 2, titleY - 6, hw, -1, hexToRgba(border.accent, 0.65));
  }

  if (border.design === "violet-clean") {
    drawDiamond(ctx, w / 2, titleY + 16, 4, border.accent, border.primary);
  }

  ctx.fillStyle =
    border.design === "blush-glow"
      ? hexToRgba(border.cream, 0.9)
      : hexToRgba(border.cream, 0.78);
  ctx.font = "600 12px Figtree, Inter, sans-serif";
  ctx.fillText(subText, w / 2, subY);
}

function drawCardDecorations(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  border: BorderStyle
) {
  switch (border.design) {
    case "feu-classic":
      drawCornerBrackets(ctx, w, h, border.accent);
      break;
    case "royal-crest":
      drawDiamondCorners(ctx, w, h, border.accent);
      // outer double border
      ctx.save();
      ctx.strokeStyle = border.accent;
      ctx.lineWidth = 2;
      roundedRectPath(ctx, 6, 6, w - 12, h - 12, getCardRadius(border.design) - 2);
      ctx.stroke();
      roundedRectPath(ctx, 12, 12, w - 24, h - 24, getCardRadius(border.design) - 4);
      ctx.strokeStyle = hexToRgba(border.primary, 0.3);
      ctx.stroke();
      ctx.restore();
      break;
    case "crimson-ornate":
      drawOrnateFlourishes(ctx, w, h, border.accent);
      break;
    case "blush-glow":
      // soft outer glow ring
      ctx.save();
      ctx.strokeStyle = hexToRgba(border.accent, 0.45);
      ctx.lineWidth = 3;
      roundedRectPath(ctx, 3, 3, w - 6, h - 6, getCardRadius(border.design));
      ctx.stroke();
      ctx.restore();
      drawStarDots(ctx, 10, h * 0.42, hexToRgba(border.accent, 0.7));
      drawStarDots(ctx, w - 36, h * 0.58, hexToRgba(border.accent, 0.7));
      break;
    case "violet-clean":
      drawPrismCorners(ctx, w, h, border.primary, border.accent);
      ctx.save();
      ctx.strokeStyle = hexToRgba(border.primary, 0.35);
      ctx.lineWidth = 1.5;
      roundedRectPath(ctx, 8, 8, w - 16, h - 16, getCardRadius(border.design));
      ctx.stroke();
      ctx.strokeStyle = hexToRgba(border.accent, 0.55);
      ctx.lineWidth = 1;
      roundedRectPath(ctx, 14, 14, w - 28, h - 28, getCardRadius(border.design) - 2);
      ctx.stroke();
      ctx.restore();
      break;
    case "ocean-wave":
      drawWaveLine(ctx, 16, h - 92, w - 32, hexToRgba(border.accent, 0.35), 3, 28);
      drawWaveLine(ctx, 16, h - 80, w - 32, hexToRgba(border.accent, 0.55), 3, 32);
      break;
  }
}

// ─── Photo frames ───────────────────────────────────────────────────────────

function drawFramedPhoto(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  border: BorderStyle
) {
  switch (border.design) {
    case "feu-classic":
      drawPhotoFeuClassic(ctx, img, x, y, w, h, border);
      break;
    case "royal-crest":
      drawPhotoRoyalCrest(ctx, img, x, y, w, h, border);
      break;
    case "crimson-ornate":
      drawPhotoCrimsonOrnate(ctx, img, x, y, w, h, border);
      break;
    case "blush-glow":
      drawPhotoBlushGlow(ctx, img, x, y, w, h, border);
      break;
    case "violet-clean":
      drawPhotoVioletClean(ctx, img, x, y, w, h, border);
      break;
    case "ocean-wave":
      drawPhotoOceanWave(ctx, img, x, y, w, h, border);
      break;
  }
}

function drawPhotoFeuClassic(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number, y: number, w: number, h: number,
  border: BorderStyle
) {
  const mat = 10;
  ctx.save();
  ctx.shadowColor = border.shadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = border.mat;
  roundedRectPath(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.restore();

  const ix = x + mat, iy = y + mat, iw = w - mat * 2, ih = h - mat * 2;
  ctx.save();
  roundedRectPath(ctx, ix, iy, iw, ih, 8);
  ctx.clip();
  ctx.drawImage(img, ix, iy, iw, ih);
  ctx.restore();

  roundedRectPath(ctx, ix, iy, iw, ih, 8);
  ctx.lineWidth = 2;
  ctx.strokeStyle = border.primary;
  ctx.stroke();
  roundedRectPath(ctx, x, y, w, h, 14);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = border.accent;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 4, y + 22);
  ctx.lineTo(x + 4, y + 4);
  ctx.lineTo(x + 22, y + 4);
  ctx.lineWidth = 4;
  ctx.strokeStyle = border.accent;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawPhotoRoyalCrest(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number, y: number, w: number, h: number,
  border: BorderStyle
) {
  const inset = 8;
  ctx.save();
  ctx.shadowColor = border.shadow;
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = border.mat;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  const ix = x + inset + 4, iy = y + inset + 4, iw = w - (inset + 4) * 2, ih = h - (inset + 4) * 2;
  ctx.drawImage(img, ix, iy, iw, ih);

  // triple frame
  ctx.strokeStyle = border.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  ctx.strokeStyle = border.primary;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + inset + 5, y + inset + 5, w - inset * 2 - 10, h - inset * 2 - 10);
  ctx.strokeStyle = border.accent;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
}

function drawPhotoCrimsonOrnate(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number, y: number, w: number, h: number,
  border: BorderStyle
) {
  const mat = 12;
  ctx.save();
  ctx.shadowColor = border.shadow;
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = border.mat;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  const ix = x + mat, iy = y + mat, iw = w - mat * 2, ih = h - mat * 2;
  ctx.drawImage(img, ix, iy, iw, ih);

  ctx.lineWidth = 4;
  ctx.strokeStyle = border.primary;
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  ctx.lineWidth = 2;
  ctx.strokeStyle = border.accent;
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

  // scroll flourishes on opposite corners
  ctx.strokeStyle = border.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + 18, y + 18, 10, Math.PI, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w - 18, y + h - 18, 10, 0, Math.PI * 0.8);
  ctx.stroke();

  // tiny gold dots
  ctx.fillStyle = border.accent;
  for (const [dx, dy] of [[22, 8], [8, 22], [w - 22, h - 8], [w - 8, h - 22]]) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPhotoBlushGlow(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number, y: number, w: number, h: number,
  border: BorderStyle
) {
  const mat = 10;
  const outerR = 22;

  // neon glow layers
  for (const [blur, alpha] of [[24, 0.2], [14, 0.35]] as const) {
    ctx.save();
    ctx.shadowColor = hexToRgba(border.accent, alpha);
    ctx.shadowBlur = blur;
    roundedRectPath(ctx, x, y, w, h, outerR);
    ctx.strokeStyle = hexToRgba(border.accent, alpha);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = border.mat;
  roundedRectPath(ctx, x, y, w, h, outerR);
  ctx.fill();

  const ix = x + mat, iy = y + mat, iw = w - mat * 2, ih = h - mat * 2;
  ctx.save();
  roundedRectPath(ctx, ix, iy, iw, ih, 16);
  ctx.clip();
  ctx.drawImage(img, ix, iy, iw, ih);
  ctx.restore();

  roundedRectPath(ctx, ix, iy, iw, ih, 16);
  ctx.lineWidth = 2;
  ctx.strokeStyle = border.primary;
  ctx.stroke();
  roundedRectPath(ctx, x, y, w, h, outerR);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = border.accent;
  ctx.stroke();

  drawStarDots(ctx, x + 4, y + 4, border.accent);
  drawStarDots(ctx, x + w - 30, y + h - 28, border.accent);
}

function drawPhotoVioletClean(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number, y: number, w: number, h: number,
  border: BorderStyle
) {
  const mat = 12;
  const ix = x + mat, iy = y + mat, iw = w - mat * 2, ih = h - mat * 2;

  ctx.save();
  ctx.shadowColor = border.shadow;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = border.mat;
  roundedRectPath(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRectPath(ctx, ix, iy, iw, ih, 4);
  ctx.clip();
  ctx.drawImage(img, ix, iy, iw, ih);
  ctx.restore();

  // double geometric frame
  ctx.strokeStyle = border.primary;
  ctx.lineWidth = 2;
  roundedRectPath(ctx, ix, iy, iw, ih, 4);
  ctx.stroke();
  ctx.strokeStyle = border.accent;
  ctx.lineWidth = 1.5;
  roundedRectPath(ctx, x + 4, y + 4, w - 8, h - 8, 6);
  ctx.stroke();

  // prism ticks on all four corners
  const tick = 12;
  ctx.strokeStyle = border.accent;
  ctx.lineWidth = 2.25;
  ctx.lineCap = "square";
  const ticks: [number, number, number, number][] = [
    [x + 4, y + 4, 1, 1],
    [x + w - 4, y + 4, -1, 1],
    [x + 4, y + h - 4, 1, -1],
    [x + w - 4, y + h - 4, -1, -1],
  ];
  for (const [tx, ty, dx, dy] of ticks) {
    ctx.beginPath();
    ctx.moveTo(tx, ty + tick * dy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(tx + tick * dx, ty);
    ctx.stroke();
  }

  drawDiamond(ctx, x + w / 2, y + 8, 4, border.accent, border.primary);
}

function drawPhotoOceanWave(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number, y: number, w: number, h: number,
  border: BorderStyle
) {
  const mat = 10;
  const outerR = 20;

  ctx.save();
  ctx.shadowColor = border.shadow;
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = border.mat;
  roundedRectPath(ctx, x, y, w, h, outerR);
  ctx.fill();
  ctx.restore();

  const ix = x + mat, iy = y + mat, iw = w - mat * 2, ih = h - mat * 2;
  ctx.save();
  roundedRectPath(ctx, ix, iy, iw, ih, 14);
  ctx.clip();
  ctx.drawImage(img, ix, iy, iw, ih);
  ctx.restore();

  roundedRectPath(ctx, ix, iy, iw, ih, 14);
  ctx.lineWidth = 2;
  ctx.strokeStyle = border.primary;
  ctx.stroke();
  roundedRectPath(ctx, x, y, w, h, outerR);
  ctx.lineWidth = 2;
  ctx.strokeStyle = border.accent;
  ctx.stroke();

  drawWaveLine(ctx, x + 8, y + 6, w - 16, hexToRgba(border.accent, 0.55), 2.5, 18);
  drawWaveLine(ctx, x + 8, y + 14, w - 16, border.accent, 3, 22);
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function drawCardFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  footerH: number,
  pad: number,
  border: BorderStyle,
  footerText: string
) {
  const footerY = h - footerH;

  switch (border.design) {
    case "feu-classic":
    case "royal-crest":
    case "crimson-ornate":
      ctx.strokeStyle = border.accent;
      ctx.lineWidth = border.design === "royal-crest" ? 2.5 : 2;
      ctx.beginPath();
      ctx.moveTo(pad, footerY);
      ctx.lineTo(w - pad, footerY);
      ctx.stroke();
      break;

    case "blush-glow":
      ctx.save();
      ctx.strokeStyle = hexToRgba(border.accent, 0.6);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(pad, footerY);
      ctx.lineTo(w - pad, footerY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      break;

    case "violet-clean": {
      ctx.strokeStyle = hexToRgba(border.accent, 0.7);
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(pad, footerY);
      ctx.lineTo(w * 0.42, footerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.58, footerY);
      ctx.lineTo(w - pad, footerY);
      ctx.stroke();
      drawDiamond(ctx, w / 2, footerY, 5, border.accent, border.primary);
      break;
    }

    case "ocean-wave":
      drawWaveLine(ctx, pad, footerY - 4, w - pad * 2, hexToRgba(border.accent, 0.4), 3, 30);
      drawWaveLine(ctx, pad, footerY, w - pad * 2, border.accent, 4, 36);
      break;
  }

  ctx.fillStyle = border.tagline;
  ctx.font = "700 23px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`> ${footerText}`, w / 2, footerY + 36);

  ctx.font = "600 17px Inter, sans-serif";
  ctx.fillStyle = border.muted;
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  ctx.fillText(date, w / 2, footerY + 64);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function captureShot(
  video: HTMLVideoElement,
  template: TemplateConfig,
  shotIndex: number
): Promise<string> {
  const rect = getCellRects(template)[shotIndex];
  const outW = Math.round(rect.w * 1.4);
  const outH = Math.round(rect.h * 1.4);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const targetRatio = outW / outH;
  let sx = 0, sy = 0, sw = vw, sh = vh;
  if (vw / vh > targetRatio) {
    sw = vh * targetRatio;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / targetRatio;
    sy = (vh - sh) / 2;
  }

  ctx.save();
  ctx.translate(outW, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export async function composeStrip(
  shots: string[],
  template: TemplateConfig,
  options: ComposeOptions = {}
): Promise<string> {
  const border = options.border ?? BORDER_STYLES_FALLBACK;
  const footerText = options.footerText ?? DEFAULT_FOOTER;
  const filterId = options.filterId ?? "none";
  const { totalW: w, totalH: h, headerH, footerH, pad } = template;
  const rects = getCellRects(template);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  drawCardBackground(ctx, w, h, border);
  drawCardHeader(ctx, w, headerH, h, border);
  drawCardDecorations(ctx, w, h, border);

  for (let i = 0; i < shots.length; i++) {
    const img = await loadImage(shots[i]);
    const filtered = applyFilterToImage(img, filterId);
    const r = rects[i];
    drawFramedPhoto(ctx, filtered, r.x, r.y, r.w, r.h, border);
  }

  drawCardFooter(ctx, w, h, footerH, pad, border, footerText);

  return canvas.toDataURL("image/png");
}

const BORDER_STYLES_FALLBACK: BorderStyle = {
  id: "feu",
  label: "FEU Classic",
  description: "",
  design: "feu-classic",
  primary: "#0E6B34",
  primaryDark: "#052E17",
  accent: "#FFC20E",
  cream: "#FAF6EC",
  mat: "#FAF6EC",
  tagline: "#0E6B34",
  muted: "#5B6B60",
  dotGrid: "rgba(14,107,52,0.10)",
  shadow: "rgba(5,46,23,0.35)",
};

/** Renders a full strip preview for the border carousel — 3 photo slots at print resolution. */
export function renderBorderPreview(border: BorderStyle): string {
  const w = 480;
  const h = 1170;
  const headerH = 68;
  const footerH = 58;
  const pad = 19;
  const gap = 13;
  const shotCount = 3;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const previewBorder = { ...border };
  drawCardBackground(ctx, w, h, previewBorder);
  drawCardHeader(ctx, w, headerH, h, previewBorder);
  drawCardDecorations(ctx, w, h, previewBorder);

  const contentW = w - pad * 2;
  const contentH = h - headerH - footerH - pad * 2;
  const originY = headerH + pad;
  const cellH = (contentH - gap * (shotCount - 1)) / shotCount;

  for (let i = 0; i < shotCount; i++) {
    const y = originY + i * (cellH + gap);
    drawFramedPhotoSync(ctx, pad, y, contentW, cellH, border, i);
  }

  drawCardFooter(ctx, w, h, footerH, pad, previewBorder, 'git commit -m "your tagline"');

  return canvas.toDataURL("image/png");
}

function fillPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  border: BorderStyle,
  index: number
) {
  const shades = [0.14, 0.1, 0.16];
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, hexToRgba(border.primary, shades[index % 3]));
  grad.addColorStop(1, hexToRgba(border.accent, 0.22));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = hexToRgba(border.muted, 0.35);
  ctx.font = "500 11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`Photo ${index + 1}`, x + w / 2, y + h / 2);
}

function drawFramedPhotoSync(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  border: BorderStyle,
  photoIndex = 0
) {
  const mat = border.design === "violet-clean" ? 14 : 10;
  const outerR =
    border.design === "blush-glow" || border.design === "ocean-wave" ? 20 :
    border.design === "royal-crest" ? 0 : 14;

  if (border.design === "royal-crest") {
    ctx.fillStyle = border.mat;
    ctx.fillRect(x, y, w, h);
    fillPhotoPlaceholder(ctx, x + 12, y + 12, w - 24, h - 24, border, photoIndex);
    ctx.strokeStyle = border.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
    ctx.strokeStyle = border.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 13, y + 13, w - 26, h - 26);
    return;
  }

  if (border.design === "violet-clean") {
    const mat = 12;
    ctx.fillStyle = border.mat;
    roundedRectPath(ctx, x, y, w, h, 8);
    ctx.fill();
    fillPhotoPlaceholder(ctx, x + mat, y + mat, w - mat * 2, h - mat * 2, border, photoIndex);
    ctx.strokeStyle = border.primary;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, x + mat, y + mat, w - mat * 2, h - mat * 2, 4);
    ctx.stroke();
    ctx.strokeStyle = border.accent;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, x + 4, y + 4, w - 8, h - 8, 6);
    ctx.stroke();
    drawDiamond(ctx, x + w / 2, y + 7, 3.5, border.accent, border.primary);
    return;
  }

  ctx.fillStyle = border.mat;
  if (outerR > 0) {
    roundedRectPath(ctx, x, y, w, h, outerR);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }

  const ix = x + mat, iy = y + mat, iw = w - mat * 2, ih = h - mat * 2;
  fillPhotoPlaceholder(ctx, ix, iy, iw, ih, border, photoIndex);

  ctx.strokeStyle = border.primary;
  ctx.lineWidth = 2;
  if (outerR > 0) {
    roundedRectPath(ctx, ix, iy, iw, ih, outerR - 4);
    ctx.stroke();
    roundedRectPath(ctx, x, y, w, h, outerR);
    ctx.strokeStyle = border.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  if (border.design === "feu-classic") {
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 18);
    ctx.lineTo(x + 4, y + 4);
    ctx.lineTo(x + 18, y + 4);
    ctx.lineWidth = 3;
    ctx.strokeStyle = border.accent;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  if (border.design === "blush-glow") {
    drawStarDots(ctx, x + 4, y + 4, border.accent);
  }

  if (border.design === "ocean-wave") {
    drawWaveLine(ctx, x + 6, y + 5, w - 12, hexToRgba(border.accent, 0.5), 2, 14);
    drawWaveLine(ctx, x + 6, y + 12, w - 12, border.accent, 2.5, 16);
  }

  if (border.design === "crimson-ornate") {
    ctx.strokeStyle = border.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
    ctx.strokeStyle = border.primary;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  }
}
