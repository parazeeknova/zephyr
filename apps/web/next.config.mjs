/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@zephyr/auth", "@zephyr/db"],
  reactStrictMode: true,
  output: "standalone",
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
        hostname: "lh3.googleusercontent.com",
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
