"use client";

import { FilterId, FILTER_LIST, getFilterCss } from "@/lib/filters";

interface Props {
  selectedId: FilterId;
  onSelect: (id: FilterId) => void;
  /** Dark panel (result screen) vs light (border stage) */
  tone?: "light" | "dark";
}

export default function FilterChips({
  selectedId,
  onSelect,
  tone = "light",
}: Props) {
  const dark = tone === "dark";

  return (
    <div className="w-full space-y-2">
      <p
        className={`font-mono text-[10px] tracking-widest uppercase ${
          dark ? "text-feu-gold/70" : "text-feu-green/60"
        }`}
      >
        Photo filter
      </p>
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {FILTER_LIST.map((f) => {
          const selected = f.id === selectedId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              className={`px-3 py-1.5 rounded-full font-display text-sm font-semibold transition-all active:scale-95 ${
                selected
                  ? dark
                    ? "bg-feu-gold text-feu-greenDark shadow-gold"
                    : "bg-feu-greenDark text-feu-cream shadow-sm"
                  : dark
                    ? "bg-feu-cream/10 text-feu-cream/80 hover:bg-feu-cream/20 border border-feu-gold/30"
                    : "bg-white text-feu-greenDark/80 hover:border-feu-gold/60 border border-feu-green/20"
              }`}
            >
              <span style={{ filter: selected ? undefined : getFilterCss(f.id) }}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
