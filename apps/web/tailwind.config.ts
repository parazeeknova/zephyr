import base from '@zephyr/tailwind/configs/config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...base,
  content: [
    './src/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
};

export default config;
