import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  experimental: {
    // ppr: true, // Disabled due to canary version requirement
    clientSegmentCache: true,
    nodeMiddleware: true,
  },
};

export default withAnalyzer(nextConfig);
