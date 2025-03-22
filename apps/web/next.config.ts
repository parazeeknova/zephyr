import { config, withAnalyzer, withStreamConfig } from '@zephyr/next';
import { withLogtail } from '@zephyr/observability/next-config';
import type { NextConfig } from 'next';
import { env } from './env';

let nextConfig: NextConfig = withLogtail({ ...config });

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

nextConfig = withStreamConfig(nextConfig);

export default nextConfig;
