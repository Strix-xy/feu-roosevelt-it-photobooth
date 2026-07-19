import { TemplateConfig, getCellRects } from "./types";

const TAGLINE = 'git commit -m "FEURture Dev"';

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
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const spacing = 26;
  ctx.save();
  ctx.fillStyle = "rgba(14,107,52,0.10)";
  for (let gy = y; gy < y + h; gy += spacing) {
    for (let gx = x; gx < x + w; gx += spacing) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const len = 30;
  const inset = 16;
  const corners: [number, number, number, number][] = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - inset, 1, -1],
    [w - inset, h - inset, -1, -1],
  ];
  ctx.save();
  ctx.strokeStyle = "#FFC20E";
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

function drawCircuitFlank(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  textHalfWidth: number,
  direction: 1 | -1
) {
  const startX = centerX + direction * (textHalfWidth + 14);
  const endX = centerX + direction * (textHalfWidth + 70);
  ctx.save();
  ctx.strokeStyle = "rgba(255,194,14,0.65)";
  ctx.fillStyle = "rgba(255,194,14,0.65)";
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

/**
 * Captures the current video frame, mirrored and center-cropped to match
 * the aspect ratio of the cell this shot will land in (cells can differ in
 * size — e.g. the portrait template's big first shot vs. its small ones).
 */
export async function captureShot(
  video: HTMLVideoElement,
  template: TemplateConfig,
  shotIndex: number
): Promise<string> {
  const rect = getCellRects(template)[shotIndex];
  // capture at 2x the on-strip cell size for crisp output
  const outW = Math.round(rect.w * 1.4);
  const outH = Math.round(rect.h * 1.4);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const targetRatio = outW / outH;
  let sx = 0,
    sy = 0,
    sw = vw,
    sh = vh;
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

/**
 * Draws one photo into its cell with a creative frame: soft drop shadow,
 * a cream mat, a thin green pinstripe, and a gold outer hairline.
 */
function drawFramedPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const mat = 10;

  ctx.save();
  ctx.shadowColor = "rgba(5,46,23,0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#FAF6EC";
  roundedRectPath(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.restore();

  // photo, clipped to rounded inset
  const ix = x + mat;
  const iy = y + mat;
  const iw = w - mat * 2;
  const ih = h - mat * 2;
  ctx.save();
  roundedRectPath(ctx, ix, iy, iw, ih, 8);
  ctx.clip();
  ctx.drawImage(img, ix, iy, iw, ih);
  ctx.restore();

  // green pinstripe, then gold hairline
  roundedRectPath(ctx, ix, iy, iw, ih, 8);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#0E6B34";
  ctx.stroke();

  roundedRectPath(ctx, x, y, w, h, 14);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#FFC20E";
  ctx.stroke();

  // small gold corner accent (top-left)
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 22);
  ctx.lineTo(x + 4, y + 4);
  ctx.lineTo(x + 22, y + 4);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFC20E";
  ctx.lineCap = "round";
  ctx.stroke();
}

/**
 * Composes the final strip: a rounded, ticket-notched cream card in the
 * template's exact aspect ratio, with a deep-green header, framed photos,
 * and a footer carrying the date + a witty IT-department tagline.
 */
export async function composeStrip(
  shots: string[],
  template: TemplateConfig
): Promise<string> {
  const { totalW: w, totalH: h, headerH, footerH, pad } = template;
  const rects = getCellRects(template);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // transparent canvas, then punch the rounded card shape with side notches
  roundedRectPath(ctx, 0, 0, w, h, 28);
  ctx.fillStyle = "#FAF6EC";
  ctx.fill();

  // faint PCB-style dot grid across the whole card (a subtle "design" texture)
  ctx.save();
  roundedRectPath(ctx, 0, 0, w, h, 28);
  ctx.clip();
  drawDotGrid(ctx, 0, 0, w, h);
  ctx.restore();

  ctx.globalCompositeOperation = "destination-out";
  const notchR = 10;
  const notchY = [0.28, 0.5, 0.72];
  for (const f of notchY) {
    ctx.beginPath();
    ctx.arc(0, h * f, notchR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w, h * f, notchR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  // deep green header band (clipped to the card's rounded shape)
  ctx.save();
  roundedRectPath(ctx, 0, 0, w, h, 28);
  ctx.clip();
  ctx.fillStyle = "#052E17";
  ctx.fillRect(0, 0, w, headerH);
  ctx.restore();

  ctx.fillStyle = "#FFC20E";
  ctx.font = "700 28px Poppins, sans-serif";
  ctx.textAlign = "center";
  const headerText = "FEU ROOSEVELT";
  const titleY = headerH * 0.42;
  ctx.fillText(headerText, w / 2, titleY);
  const headerHalfWidth = ctx.measureText(headerText).width / 2;
  drawCircuitFlank(ctx, w / 2, titleY - 6, headerHalfWidth, 1);
  drawCircuitFlank(ctx, w / 2, titleY - 6, headerHalfWidth, -1);

  ctx.fillStyle = "rgba(250,246,236,0.75)";
  ctx.font = "600 12px Inter, sans-serif";
  ctx.fillText(
    "ACES · ALLIANCE OF COMPUTING EDUCATION STUDENTS",
    w / 2,
    headerH * 0.74
  );

  // camera-style corner brackets framing the whole card
  drawCornerBrackets(ctx, w, h);

  // photo cells (rects vary in size per template layout — e.g. 1 big + 2 small)
  for (let i = 0; i < shots.length; i++) {
    const img = await loadImage(shots[i]);
    const r = rects[i];
    drawFramedPhoto(ctx, img, r.x, r.y, r.w, r.h);
  }

  // footer: gold hairline, tagline, date
  const footerY = h - footerH;
  ctx.strokeStyle = "#FFC20E";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, footerY);
  ctx.lineTo(w - pad, footerY);
  ctx.stroke();

  ctx.fillStyle = "#0E6B34";
  ctx.font = "700 23px 'JetBrains Mono', monospace";
  ctx.fillText(`> ${TAGLINE}`, w / 2, footerY + 36);

  ctx.font = "500 13px Inter, sans-serif";
  ctx.fillStyle = "#5B6B60";
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  ctx.fillText(date, w / 2, footerY + 60);

  return canvas.toDataURL("image/png");
}
