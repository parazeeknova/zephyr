/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: {
      compilationMode: 'annotation',
    },
    staleTimes: {
      dynamic: 30,
    },
  },
  compiler: {
    styledComponents: true,
  }
};

export default nextConfig;
