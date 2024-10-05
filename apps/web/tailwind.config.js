const base = require("@zephyr/ui/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./app/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        custom: ["SofiaProReg", "sans-serif"]
      }
    }
  },
  plugins: [require("@tailwindcss/aspect-ratio")]
};
