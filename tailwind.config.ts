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
        background: "#050606",
        foreground: "#ffffff",
        subtle: "#A0AAB2",
        obsidian: "#030404",
        forest: "#0B2B1B",
        emerald: "#10B981",
        accent: {
          DEFAULT: "#A3E635",
          dark: "#4e7a06",
        },
      },
      fontFamily: {
        sans: ["bauserif", "sans-serif"],
        display: ["bauserif", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      letterSpacing: {
        wide: "0.05em",
        wider: "0.1em",
        widest: "0.2em",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'ambient-pulse': 'ambient-pulse 10s ease-in-out infinite alternate',
      },
      keyframes: {
        'ambient-pulse': {
          '0%': { opacity: '0.4', transform: 'scale(1)' },
          '100%': { opacity: '0.8', transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
