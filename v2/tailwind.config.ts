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
        primary: {
          DEFAULT: "#181E29",
          50: "#f0f1f3",
          100: "#d9dce2",
          200: "#b8bdc8",
          300: "#8d95a6",
          400: "#6b7485",
          500: "#181E29",
          600: "#141923",
          700: "#10141d",
          800: "#0d1017",
          900: "#0a0c12",
        },
        accent: {
          DEFAULT: "#f24d12",
          50: "#fef2f0",
          100: "#fde2dc",
          200: "#fbc5b8",
          300: "#f99d88",
          400: "#f66d56",
          500: "#f24d12",
          600: "#e3390a",
          700: "#bc2d08",
          800: "#9a280d",
          900: "#7f2610",
        },
        background: {
          DEFAULT: "#f6f6f7",
        },
      },
      fontFamily: {
        sans: ["var(--font-source-sans-pro)", "Source Sans Pro", "sans-serif"],
      },
      boxShadow: {
        'minimal': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

