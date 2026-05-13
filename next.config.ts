import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/devpreview', destination: '/preview/', permanent: true },
      { source: '/devpreview/', destination: '/preview/', permanent: true },
    ];
  },
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '',
  assetPrefix: '',
};

export default withBundleAnalyzer(nextConfig);