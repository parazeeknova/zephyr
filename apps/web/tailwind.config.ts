import base from "@zephyr/ui/tailwind-preset";
import type { Config } from "tailwindcss";

const config: Config = {
  ...base,
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}"
  ]
};

export default config;
