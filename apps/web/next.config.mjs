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
  }
};

export default nextConfig;
