export type BorderStyleId =
  | "feu"
  | "royal-blue"
  | "crimson"
  | "blush-pink"
  | "violet"
  | "ocean-teal";

/** Unique structural design — each border has its own frame language, not just palette. */
export type BorderDesign =
  | "feu-classic"
  | "royal-crest"
  | "crimson-ornate"
  | "blush-glow"
  | "violet-clean"
  | "ocean-wave";

export interface BorderStyle {
  id: BorderStyleId;
  label: string;
  description: string;
  design: BorderDesign;
  primary: string;
  primaryDark: string;
  accent: string;
  cream: string;
  mat: string;
  tagline: string;
  muted: string;
  dotGrid: string;
  shadow: string;
}

export const DEFAULT_FOOTER = 'git commit -m "FEURture Dev"';

export const BORDER_STYLES: Record<BorderStyleId, BorderStyle> = {
  feu: {
    id: "feu",
    label: "FEU Classic",
    description: "Ticket notches, PCB dots, circuit flanks & gold rail — the original IT look.",
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
  },
  "royal-blue": {
    id: "royal-blue",
    label: "Royal Blue",
    description: "Heraldic double frames, diamond crest & woven crosshatch.",
    design: "royal-crest",
    primary: "#1E40AF",
    primaryDark: "#0F172A",
    accent: "#CBD5E1",
    cream: "#F8FAFC",
    mat: "#F1F5F9",
    tagline: "#1E40AF",
    muted: "#64748B",
    dotGrid: "rgba(30,64,175,0.08)",
    shadow: "rgba(15,23,42,0.30)",
  },
  crimson: {
    id: "crimson",
    label: "Crimson",
    description: "Vintage banner header, gold filigree corners & diagonal stripes.",
    design: "crimson-ornate",
    primary: "#B91C1C",
    primaryDark: "#450A0A",
    accent: "#FCD34D",
    cream: "#FFF7ED",
    mat: "#FFFBEB",
    tagline: "#B91C1C",
    muted: "#78716C",
    dotGrid: "rgba(185,28,28,0.09)",
    shadow: "rgba(69,10,10,0.32)",
  },
  "blush-pink": {
    id: "blush-pink",
    label: "Blush Pink",
    description: "Soft polka dots, sparkle clusters & a dreamy neon glow.",
    design: "blush-glow",
    primary: "#DB2777",
    primaryDark: "#500724",
    accent: "#F9A8D4",
    cream: "#FFF1F2",
    mat: "#FFE4E6",
    tagline: "#DB2777",
    muted: "#9D174D",
    dotGrid: "rgba(219,39,119,0.10)",
    shadow: "rgba(80,7,36,0.28)",
  },
  violet: {
    id: "violet",
    label: "Violet",
    description: "Constellation grid, prism corners & gem accents — cosmic modern.",
    design: "violet-clean",
    primary: "#7C3AED",
    primaryDark: "#2E1065",
    accent: "#C4B5FD",
    cream: "#FAF5FF",
    mat: "#F3E8FF",
    tagline: "#7C3AED",
    muted: "#6B7280",
    dotGrid: "rgba(124,58,237,0.10)",
    shadow: "rgba(46,16,101,0.28)",
  },
  "ocean-teal": {
    id: "ocean-teal",
    label: "Ocean Teal",
    description: "Layered waves, foam bubbles & pill-shaped photo frames.",
    design: "ocean-wave",
    primary: "#0D9488",
    primaryDark: "#042F2E",
    accent: "#5EEAD4",
    cream: "#F0FDFA",
    mat: "#CCFBF1",
    tagline: "#0D9488",
    muted: "#5B7B76",
    dotGrid: "rgba(13,148,136,0.08)",
    shadow: "rgba(4,47,46,0.28)",
  },
};

export const BORDER_STYLE_LIST = Object.values(BORDER_STYLES);
