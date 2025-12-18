import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    allowedDevOrigins: ['192.168.0.16:8080'],
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
};

export default nextConfig;
