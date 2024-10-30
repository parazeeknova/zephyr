/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@zephyr/auth", "@zephyr/db"],
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 30
    }
  },
  compiler: {
    styledComponents: true
  },
  serverExternalPackages: ["@node-rs/argon2", "@prisma/client"],
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
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag"
      }
    ];
  }
};

export default nextConfig;
