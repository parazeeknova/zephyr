import type { Config } from "tailwindcss";
import base from "./tailwind-preset";

const config: Config = {
  ...base,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}"
  ]
};

export default config;
