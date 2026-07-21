/**
 * Lightweight booth SFX via Web Audio API — no audio files required.
 * Call unlockAudio() from a user gesture (Start / Capture) so browsers allow playback.
 */

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
}

export function setMuted(next: boolean) {
  muted = next;
}

export function isMuted() {
  return muted;
}

function beep(
  freq: number,
  durationMs: number,
  type: OscillatorType = "sine",
  gain = 0.12,
  when = 0
) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.02);
}

/** Short tick for countdown numbers (pitch rises as it approaches 1). */
export function playCountdownTick(n: number) {
  const pitch = 520 + Math.max(0, 4 - n) * 80;
  beep(pitch, 90, "square", 0.08);
}

/** Bright cue on "SMILE!". */
export function playSmileCue() {
  beep(880, 120, "triangle", 0.1);
  beep(1320, 140, "triangle", 0.07, 0.05);
}

/** Camera shutter / flash click. */
export function playShutter() {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const t0 = c.currentTime;
  // Noise burst
  const len = Math.floor(c.sampleRate * 0.05);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.22, t0);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
  noise.connect(ng);
  ng.connect(c.destination);
  noise.start(t0);

  beep(180, 40, "square", 0.1);
}

/** Soft success when strip is ready / keep-all finishes. */
export function playSuccess() {
  beep(523.25, 100, "sine", 0.09);
  beep(659.25, 120, "sine", 0.09, 0.09);
  beep(783.99, 180, "sine", 0.1, 0.18);
}

/** Light UI tap — most buttons. */
export function playClick() {
  unlockAudio();
  beep(720, 45, "triangle", 0.06);
}

/** Stronger confirm / primary CTA. */
export function playConfirm() {
  unlockAudio();
  beep(640, 55, "triangle", 0.07);
  beep(960, 70, "sine", 0.05, 0.04);
}

/** Subtle prev/next navigation. */
export function playNav() {
  unlockAudio();
  beep(480, 35, "sine", 0.045);
}
