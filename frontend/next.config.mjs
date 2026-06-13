/** @type {import('next').NextConfig} */
const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:7004")
  .trim()
  .replace(/\/api\/?$/, "");

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "country-state-city",
      "recharts",
      "react-select",
      "@heroicons/react",
      "date-fns",
    ],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7004',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '178.18.241.5',
        port: '7004',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
