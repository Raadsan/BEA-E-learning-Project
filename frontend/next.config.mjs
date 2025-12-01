/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Improve stability and prevent crashes
  reactStrictMode: true,
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
};

export default nextConfig;
