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
        "soft": "0 2px 8px rgba(0,0,0,0.04)",
        "medium": "0 4px 16px rgba(0,0,0,0.06)",
        "strong": "0 8px 24px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        "instrument-sans": ["var(--font-instrument-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
