import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 30px rgba(2,6,23,0.10)" },
      // Keep a default brand color, but most accents are driven by CSS variables for theme switching.
      colors: { brand: { 500: "#7c3aed", 600: "#6d28d9" } },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 55%, var(--accent-3) 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, color-mix(in srgb, var(--accent-1) 20%, transparent) 0%, color-mix(in srgb, var(--accent-2) 18%, transparent) 55%, color-mix(in srgb, var(--accent-3) 16%, transparent) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
