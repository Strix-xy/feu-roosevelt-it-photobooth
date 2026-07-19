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
          green: "#0E6B34",      // primary — hope
          greenDark: "#052E17",  // deep shadow green, near-black panels
          greenLight: "#1E9350",
          gold: "#FFC20E",       // primary — opportunity
          goldDark: "#C99400",
          goldLight: "#FFE08A",
          cream: "#FAF6EC",      // warm paper background
          ink: "#14231B",        // body text on cream
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "circuit":
          "radial-gradient(circle at 1px 1px, rgba(255,194,14,0.14) 1px, transparent 0)",
      },
      boxShadow: {
        gold: "0 0 0 3px rgba(255,194,14,0.35)",
        panel: "0 20px 60px -15px rgba(5,46,23,0.55)",
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
        "flash": {
          "0%": { opacity: "0.9" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        flash: "flash 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
