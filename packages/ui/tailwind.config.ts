import base from '@zephyr/tailwind/configs/config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...base,
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './shadui/*.{js,ts,jsx,tsx}',
    './**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
