import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  transpilePackages: ["@zephyr/auth", "@zephyr/db", "@zephyr/config"],
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 30
    }
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
    "@aws-sdk/client-s3"
  ],
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**"
      },
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
        protocol: "http",
        hostname: "localhost",
        port: "9001",
        pathname: `/${process.env.MINIO_BUCKET_NAME}/**`
      }
    ]
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
    NEXT_PUBLIC_MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || "uploads"
  },

  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
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
