import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  transpilePackages: ["@zephyr/auth", "@zephyr/db", "@zephyr/config"],
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 30
    },
    serverActions: {
      bodySizeLimit: "1mb",
      allowedOrigins: ["*"]
    }
  },

  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "./tsconfig.json"
  },

  compiler: {
    styledComponents: true,
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"]
          }
        : false
  },

  serverExternalPackages: [
    "@node-rs/argon2",
    "@prisma/client",
    "@aws-sdk/client-s3",
    "ioredis",
    "stream-chat"
  ],
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "minio-objectstorage.zephyyrr.in",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "localhost",
        pathname: "/**"
      }
    ],
    unoptimized: process.env.NODE_ENV === "development"
  },

  rewrites: async () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag"
      }
    ];
  },

  env: {
    NEXT_PRIVATE_SKIP_VALIDATION:
      process.env.NEXT_PRIVATE_SKIP_VALIDATION || "false",
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || "development",
    NEXT_PUBLIC_MINIO_ENDPOINT:
      process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "http://localhost:9001",
    NEXT_PUBLIC_MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || "uploads",
    NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
    STREAM_SECRET: process.env.STREAM_SECRET,
    NEXT_PUBLIC_STREAM_CONFIGURED:
      process.env.NEXT_PUBLIC_STREAM_KEY && process.env.STREAM_SECRET
        ? "true"
        : "false"
  },

  webpack: (config, { dev, isServer }) => {
    if (isServer) {
      const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY;
      const streamSecret = process.env.STREAM_SECRET;

      if (!streamKey || !streamSecret) {
        console.warn(
          "\x1b[33m%s\x1b[0m",
          `
⚠️  Warning: Stream Chat environment variables are missing
This may cause chat features to be disabled in production.
Required variables:
- NEXT_PUBLIC_STREAM_KEY
- STREAM_SECRET
        `
        );
      } else {
        console.log(
          "\x1b[32m%s\x1b[0m",
          `
✅ Stream Chat configuration detected:
- NEXT_PUBLIC_STREAM_KEY: ${streamKey.substring(0, 5)}...
- STREAM_SECRET: ${streamSecret ? "[Set]" : "[Missing]"}
        `
        );
      }
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser")
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser"
        })
      );
    }

    if (isServer && !dev) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        if (entries["app/not-found"] || entries["pages/_error"]) {
          process.env.NEXT_PRIVATE_SKIP_VALIDATION = "true";
        }
        return entries;
      };
    }

    return config;
  },

  output: "standalone"
} as const;

export default nextConfig;
