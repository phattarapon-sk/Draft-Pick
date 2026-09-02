import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050816",
        panel: "#0B1020",
        card: "#12182D",
        "card-hover": "#1A223E",
        "team-blue": "#00D9FF",
        "team-blue-dark": "#0084A3",
        "team-red": "#FF3864",
        "team-red-dark": "#A81E3B",
        gold: "#FFD166",
        neon: {
          cyan: "#00D9FF",
          red: "#FF3864",
          yellow: "#FFD166",
          purple: "#A855F7",
          green: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 25px rgba(0, 217, 255, 0.5)",
        "glow-red": "0 0 25px rgba(255, 56, 100, 0.5)",
        "glow-gold": "0 0 25px rgba(255, 209, 102, 0.5)",
        "glow-purple": "0 0 25px rgba(168, 85, 247, 0.5)",
        "inner-glow": "inset 0 0 20px rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "light-sweep": "lightSweep 2.5s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite alternate",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        lightSweep: {
          "0%": { transform: "translateX(-150%) skewX(-25deg)" },
          "100%": { transform: "translateX(250%) skewX(-25deg)" },
        },
        glowPulse: {
          "0%": { opacity: "0.5", filter: "drop-shadow(0 0 8px currentColor)" },
          "100%": { opacity: "1", filter: "drop-shadow(0 0 20px currentColor)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
