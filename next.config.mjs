import withBundleAnalyzer from '@next/bundle-analyzer';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Only initialize the Cloudflare dev helpers in development to avoid
// attempting to open listeners during production builds/CI.
if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

// TODO cache-control headers don't work for static files
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Ensure Next outputs a full standalone bundle that OpenNext expects
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_LINTER === 'true'
  },
  typescript: {
    ignoreBuildErrors: process.env.SKIP_LINTER === 'true'
  }
};

export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzer()(nextConfig)
  : nextConfig;
