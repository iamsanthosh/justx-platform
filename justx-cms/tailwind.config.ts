import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0D1B2A", 2: "#1E3A5F" },
        cyan: { DEFAULT: "#00BFB3", light: "#E6F9F8" },
        off: "#F8F4EE",
        body: "#4A5568",
        muted: "#8A99AB",
        border: "#E0D8CE",
      },
      fontFamily: {
        display: ["'DM Serif Display'", "serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.06)",
        md: "0 8px 32px rgba(0,0,0,0.10)",
        lg: "0 24px 64px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
