/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        drac: {
          bg: "#0D1B2A",
          surface: "#162032",
          surface2: "#1E2D42",
          navy: "#1A3A5C",
          gold: "#F5C842",
          "gold-muted": "rgba(245,200,66,0.15)",
          red: "#E63946",
          green: "#1D9E75",
          text: "#F0F4F8",
          muted: "#7A90A8",
          border: "rgba(245,200,66,0.15)",
        },
      },
      fontFamily: {
        heading: ["Bebas Neue", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "gold-sm": "0 0 8px 2px rgba(245,200,66,0.4)",
        "gold-md": "0 0 16px 4px rgba(245,200,66,0.35)",
        "glow-blue": "0 0 12px 3px rgba(33,150,243,0.45)",
        "glow-purple": "0 0 12px 3px rgba(156,39,176,0.45)",
        "glow-orange": "0 0 12px 3px rgba(255,152,0,0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        rarityPulse: {
          "0%, 100%": { boxShadow: "0 0 8px 2px currentColor" },
          "50%": { boxShadow: "0 0 20px 6px currentColor" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        drawCheck: {
          from: { strokeDashoffset: 48 },
          to: { strokeDashoffset: 0 },
        },
        fadeInUp: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 3.2s ease-in-out infinite",
        "pulse-gold": "rarityPulse 2s infinite",
        "bounce-soft": "bounceSoft 1.6s ease-in-out infinite",
        "draw-check": "drawCheck 0.7s ease forwards",
        "fade-in-up": "fadeInUp 0.35s ease forwards",
      },
    },
  },
  plugins: [],
};
