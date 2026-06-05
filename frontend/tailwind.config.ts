import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        carbon: "#050708",
        panel: "#0D1114",
        mist: "#8d84e8",
        orchid: "#A8B3AD",
        sage: "#22C55E",
        signal: "#8BD3E6",
        matrix: "#8d84e8",
        caution: "#F59E0B"
      },
      fontFamily: {
        sans: ["Inter", "Geist", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"]
      },
      boxShadow: {
        glow: "0 20px 70px rgba(0, 0, 0, 0.34)"
      }
    }
  },
  plugins: []
};

export default config;
