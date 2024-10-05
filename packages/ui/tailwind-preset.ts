import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        custom: ["SofiaProReg", "sans-serif"]
      },
      animation: {
        shimmer: "shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      colors: {
        brand: {
          "50": "#fff7ed",
          "100": "#ffedd5",
          "200": "#fed7aa",
          "300": "#fdba74",
          "400": "#fb923c",
          "500": "#f97316",
          "600": "#ea580c",
          "700": "#c2410c",
          "800": "#9a3412",
          "900": "#7c2d12",
          "950": "#431407"
        },
        gray: colors.neutral,
        green: colors.emerald
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 }
        }
      }
    }
  },
  variants: { extend: {} }
};
