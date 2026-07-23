import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        feu: {
          green: "#0E6B34",
          greenDark: "#052E17",
          greenLight: "#1E9350",
          gold: "#FFC20E",
          goldDark: "#C99400",
          goldLight: "#FFE08A",
          cream: "#FAF6EC",
          ink: "#14231B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        circuit:
          "radial-gradient(circle at 1px 1px, rgba(255,194,14,0.14) 1px, transparent 0)",
        "gold-cta":
          "linear-gradient(165deg, #FFE08A 0%, #FFC20E 42%, #E5A800 100%)",
        "panel-shine":
          "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, transparent 42%, rgba(255,194,14,0.06) 100%)",
      },
      boxShadow: {
        gold: "0 0 0 3px rgba(255,194,14,0.35)",
        "gold-soft": "0 8px 28px -8px rgba(201,148,0,0.45)",
        panel: "0 24px 64px -18px rgba(5,46,23,0.5)",
        "panel-lift":
          "0 4px 6px -1px rgba(5,46,23,0.08), 0 20px 48px -16px rgba(5,46,23,0.28)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shutter: {
          "0%": { opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        flash: {
          "0%": { opacity: "0.9" },
          "100%": { opacity: "0" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.92)", opacity: "0.55" },
          "70%, 100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        flash: "flash 0.4s ease-out forwards",
        "float-soft": "float-soft 5.5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fade-up 0.55s ease-out both",
        shimmer: "shimmer 3.2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
