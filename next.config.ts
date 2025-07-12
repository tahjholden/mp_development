import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // ppr: true, // Disabled due to canary version requirement
    clientSegmentCache: true,
    nodeMiddleware: true
  }
};

export default nextConfig;
