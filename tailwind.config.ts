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
        "lime-green": "#D9F14B",
        "cream-white": "#EFEDE6",
        "false-black": "#1A1B12",
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
