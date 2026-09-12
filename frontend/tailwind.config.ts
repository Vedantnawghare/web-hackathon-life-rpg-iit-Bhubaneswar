import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-cinzel)", "serif"],
        mono: ["var(--font-rajdhani)", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
          dark: "#78350f",
        },
        realm: {
          intellect: "#38bdf8",
          strength: "#f43f5e",
          discipline: "#10b981",
          vitality: "#f59e0b",
          creativity: "#c084fc",
        },
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(245, 158, 11, 0.25)",
        "arcane-glow": "0 0 25px rgba(168, 85, 247, 0.3)",
        "realm-glow": "0 0 20px rgba(56, 189, 248, 0.25)",
        "pedestal": "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(245, 158, 11, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
