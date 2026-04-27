/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eaf0f8",
          100: "#c5d5eb",
          500: "#2e75b6",
          700: "#1a3a5c",
          900: "#0f2238",
        },
        accent: {
          400: "#f25c69",
          500: "#e63946",
          600: "#c1121f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};