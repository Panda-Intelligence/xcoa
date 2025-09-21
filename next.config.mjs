import withBundleAnalyzer from '@next/bundle-analyzer';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
initOpenNextCloudflareForDev();

// TODO cache-control headers don't work for static files
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // 移到根级别的配置
  serverExternalPackages: ['@opennextjs/cloudflare'],
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_LINTER === 'true'
  },
  typescript: {
    ignoreBuildErrors: process.env.SKIP_LINTER === 'true'
  },
  // 针对 Cloudflare Workers 的构建优化 - 最简化配置
  webpack: (config, { isServer, dev }) => {
    // 开发环境保持默认
    if (dev) {
      return config;
    }

    // 生产环境：完全禁用代码分割以避免 chunk 错误
    config.optimization = {
      ...config.optimization,
      splitChunks: false, // 完全禁用代码分割
      runtimeChunk: false,
    };

    // 最小化 polyfill
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    
    return config;
  },
  // 针对 Cloudflare 的输出优化
  output: 'standalone',
  // 图片优化配置
  images: {
    unoptimized: true, // Cloudflare 有自己的图片优化
  },
  // 压缩配置
  compress: false, // Cloudflare 会处理压缩
};

export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzer()(nextConfig)
  : nextConfig;
