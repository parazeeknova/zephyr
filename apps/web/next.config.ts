import type { NextConfig } from "next";

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

  serverExternalPackages: ["@node-rs/argon2", "@prisma/client"],
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
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || "development"
  },

  webpack: (config, { dev, isServer }) => {
    // Skip validation for static pages during build
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

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false
      };
    }

    return config;
  },

  output: "standalone"
} as const;

export default nextConfig;
