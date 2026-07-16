import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          light: "var(--color-primary-light)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        background: "var(--color-background)",
        card: "var(--color-card)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        border: {
          DEFAULT: "var(--color-border)",
          light: "var(--color-border-light)",
        },
        footer: {
          bg: "var(--color-footer-bg)",
          text: "var(--color-footer-text)",
          "text-muted": "var(--color-footer-text-muted)",
          border: "var(--color-footer-border)",
        },
      },
      boxShadow: {
        "soft": "var(--shadow-soft)",
        "medium": "var(--shadow-medium)",
        "strong": "var(--shadow-strong)",
        "glow": "var(--shadow-glow)",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        "instrument-sans": ["var(--font-instrument-sans)", "sans-serif"],
      },
      borderRadius: {
        panel: "var(--radius-panel)",
      },
    },
  },
  plugins: [],
};

export default config;
