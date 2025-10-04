import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '',
  assetPrefix: '',
};

export default withBundleAnalyzer(nextConfig);
