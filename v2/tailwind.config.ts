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
          DEFAULT: "#0f36a5",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#0f36a5",
          600: "#0d2e8c",
          700: "#0b2573",
          800: "#091c5a",
          900: "#071341",
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

