/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "arena-bg":    "#050816",
        "arena-card":  "#101827",
        "arena-cyan":  "#00E5FF",
        "arena-red":   "#FF0055",
        "arena-green": "#00FF88",
        "arena-gold":  "#FFD700",
        "arena-purple":"#9D4EDD",
        "arena-border":"rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        neon:    "0 0 12px rgba(0,229,255,0.45), 0 0 30px rgba(0,229,255,0.15)",
        danger:  "0 0 12px rgba(255,0,85,0.45),  0 0 30px rgba(255,0,85,0.15)",
        success: "0 0 12px rgba(0,255,136,0.45), 0 0 30px rgba(0,255,136,0.15)",
        gold:    "0 0 12px rgba(255,215,0,0.45),  0 0 30px rgba(255,215,0,0.15)",
        card:    "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0,229,255,0.3)" },
          "50%":       { boxShadow: "0 0 24px rgba(0,229,255,0.8), 0 0 48px rgba(0,229,255,0.3)" },
        },
        flicker: {
          "0%, 100%": { opacity: 1 },
          "92%":      { opacity: 1 },
          "93%":      { opacity: 0.4 },
          "94%":      { opacity: 1 },
          "96%":      { opacity: 0.6 },
          "97%":      { opacity: 1 },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: 0, transform: "translateX(30px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
        "count-down": {
          "0%":   { transform: "scale(1.4)", opacity: 0 },
          "20%":  { transform: "scale(1)",   opacity: 1 },
          "80%":  { transform: "scale(0.9)", opacity: 1 },
          "100%": { transform: "scale(0.7)", opacity: 0 },
        },
        "glow-ping": {
          "0%":   { transform: "scale(1)",   opacity: 1 },
          "100%": { transform: "scale(1.8)", opacity: 0 },
        },
        "typing-dot": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
          "40%":           { transform: "scale(1)",   opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to:   { width: "var(--progress-width)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-neon":     "pulse-neon 2.5s ease-in-out infinite",
        flicker:          "flicker 4s linear infinite",
        "slide-up":       "slide-up 0.4s ease-out both",
        "slide-in-right": "slide-in-right 0.4s ease-out both",
        "count-down":     "count-down 0.9s ease-in-out both",
        "glow-ping":      "glow-ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
        "typing-dot":     "typing-dot 1.4s ease-in-out infinite",
        float:            "float 3s ease-in-out infinite",
        "progress-fill":  "progress-fill 1s ease-out both",
        shimmer:          "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "cyber-grid":    "linear-gradient(rgba(0,229,255,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(0,229,255,0.04) 1px,transparent 1px)",
        "radial-glow-cyan":"radial-gradient(circle at 50% 0%, rgba(0,229,255,0.18) 0%, transparent 60%)",
        "radial-glow-red": "radial-gradient(circle at 50% 0%, rgba(255,0,85,0.15) 0%, transparent 55%)",
        "gradient-card":   "linear-gradient(135deg, rgba(16,24,39,0.9) 0%, rgba(8,11,22,0.95) 100%)",
      },
      backgroundSize: {
        "cyber-grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
