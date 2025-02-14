import withBundleAnalyzer from '@next/bundle-analyzer';
// @ts-expect-error - This is a valid webpack plugin
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import type { NextConfig } from 'next';

const otelRegex = /@opentelemetry\/instrumentation/;

export const config: NextConfig = {
  transpilePackages: ['@zephyr/auth', '@zephyr/db', '@zephyr/config'],
  reactStrictMode: true,
  experimental: {
    staleTimes: { dynamic: 30 },
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: ['*'],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },
  compiler: {
    styledComponents: true,
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'minio-objectstorage.zephyyrr.in' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    config.ignoreWarnings = [{ module: otelRegex }];

    return config;
  },
  output: 'standalone',
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);

export const withStreamConfig = (sourceConfig: NextConfig): NextConfig => ({
  ...sourceConfig,
  webpack: (config, { isServer, ...options }) => {
    const existingWebpack = sourceConfig.webpack;
    const updatedConfig =
      existingWebpack?.(config, { isServer, ...options }) ?? config;

    if (!isServer) {
      updatedConfig.resolve.fallback = {
        ...updatedConfig.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };
    }

    return updatedConfig;
  },
});
