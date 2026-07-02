import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/devpreview', destination: '/', permanent: true },
      { source: '/devpreview/', destination: '/', permanent: true },
      { source: '/construction', destination: '/', permanent: true },
      { source: '/construction/', destination: '/', permanent: true },
    ];
  },
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vumbnail.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
        pathname: '/**',
      },
    ],
  },
  basePath: '',
  assetPrefix: '',
};

export default withBundleAnalyzer(nextConfig);
