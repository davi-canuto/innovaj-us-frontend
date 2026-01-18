import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://innova-jus-api-production.up.railway.app/:path*',
      },
    ];
  },
};

export default nextConfig;
