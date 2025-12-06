/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Improve stability and prevent crashes
  reactStrictMode: true,
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
