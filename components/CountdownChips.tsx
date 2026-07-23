"use client";

import { CountdownPresetId, COUNTDOWN_PRESETS, COUNTDOWN_PRESET_LIST } from "@/lib/countdown";
import { playClick } from "@/lib/sounds";

interface Props {
  selectedId: CountdownPresetId;
  onSelect: (id: CountdownPresetId) => void;
  disabled?: boolean;
}

export default function CountdownChips({
  selectedId,
  onSelect,
  disabled,
}: Props) {
  const selected = COUNTDOWN_PRESETS[selectedId];

  return (
    <div className="w-full space-y-2">
      <p className="font-mono text-[10px] tracking-widest uppercase text-feu-green/60 text-center">
        Countdown pace
      </p>
      <div className="flex gap-2 justify-center">
        {COUNTDOWN_PRESET_LIST.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                playClick();
                onSelect(p.id);
              }}
              className={`flex-1 max-w-[8.5rem] px-2.5 py-2.5 rounded-xl font-display text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
                active
                  ? "bg-feu-greenDark text-feu-cream shadow-panel-lift ring-2 ring-feu-gold/40"
                  : "bg-white/85 text-feu-greenDark/80 border border-feu-green/15 shadow-sm hover:border-feu-gold/60"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <p className="text-center font-body text-xs text-feu-ink/55 leading-snug px-1 min-h-[2.5rem]">
        {selected.description}
      </p>
    </div>
  );
}
