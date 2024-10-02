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
  plugins: [require("@tailwindcss/aspect-ratio")]
};
