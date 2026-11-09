import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // App (light) palette, unchanged
        cobalt: { DEFAULT: "#2338FF", deep: "#1626C9" },
        navy: { DEFAULT: "#0B1033", soft: "#161C4A" },
        mist: { DEFAULT: "#EDEFF7", line: "#D9DCEB" },
        caption: "#FFD60A",
        rec: "#E5322D",
        // Marketing (dark-first) tokens
        ink: "#07080F",
        surface: { DEFAULT: "#0F1220", 2: "#161A2E" },
        fg: { DEFAULT: "#F5F6FB", muted: "#A9AFC6", subtle: "#8189A6" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { card: "1.25rem", panel: "1.75rem" },
      boxShadow: {
        "glow-yellow": "0 0 0 1px rgba(255,214,10,.4), 0 10px 40px -10px rgba(255,214,10,.45)",
        "glow-cobalt": "0 30px 90px -30px rgba(35,56,255,.6)",
        card: "0 1px 0 0 rgba(255,255,255,.04) inset, 0 20px 50px -30px rgba(0,0,0,.8)",
      },
      spacing: { section: "6rem", "section-lg": "8.5rem" },
      maxWidth: { container: "76rem", prose: "44rem" },
    },
  },
  plugins: [],
} satisfies Config;
