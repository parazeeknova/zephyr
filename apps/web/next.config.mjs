/** @type {import('next').NextConfig} */
const nextConfig = {
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
  serverExternalPackages: ["@node-rs/argon2", "@prisma/client"]
};

export default nextConfig;
