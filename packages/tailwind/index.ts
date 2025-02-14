import resolveConfig from 'tailwindcss/resolveConfig';
import { config } from './configs/config';

export const tailwind = resolveConfig(config);
