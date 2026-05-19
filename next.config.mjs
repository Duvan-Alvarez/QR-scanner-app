/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;
