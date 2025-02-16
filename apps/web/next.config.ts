import { config, withAnalyzer, withStreamConfig } from '@zephyr/next';
import type { NextConfig } from 'next';
import { env } from './env';

let nextConfig: NextConfig = { ...config };

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

nextConfig = withStreamConfig(nextConfig);

export default nextConfig;
