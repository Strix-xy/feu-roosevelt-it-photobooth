export type CountdownPresetId = "quick" | "normal" | "group";

export interface CountdownPreset {
  id: CountdownPresetId;
  label: string;
  description: string;
  /** Numbers shown before "SMILE!" (e.g. [3,2,1] or [5,4,3,2,1]) */
  beats: number[];
  /** ms per beat number */
  beatMs: number;
  /** ms for the "SMILE!" flash cue */
  smileMs: number;
  /** pause between shots in a multi-shot session */
  betweenShotsMs: number;
}

export const COUNTDOWN_PRESETS: Record<CountdownPresetId, CountdownPreset> = {
  quick: {
    id: "quick",
    label: "Quick",
    description:
      "Snappy 3-2-1 — about half a second per number, much faster than Normal.",
    beats: [3, 2, 1],
    beatMs: 500,
    smileMs: 250,
    betweenShotsMs: 250,
  },
  normal: {
    id: "normal",
    label: "Normal",
    description: "Classic 3-2-1 booth pace — comfortable time between numbers.",
    beats: [3, 2, 1],
    beatMs: 800,
    smileMs: 400,
    betweenShotsMs: 500,
  },
  group: {
    id: "group",
    label: "Group",
    description:
      "Longer 5-4-3-2-1 countdown — extra time for groups to get into pose.",
    beats: [5, 4, 3, 2, 1],
    beatMs: 900,
    smileMs: 450,
    betweenShotsMs: 700,
  },
};

export const COUNTDOWN_PRESET_LIST = Object.values(COUNTDOWN_PRESETS);
export const DEFAULT_COUNTDOWN: CountdownPresetId = "normal";
