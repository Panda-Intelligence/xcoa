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
  // 将大型包标记为服务端外部包，减少 Worker 大小
  serverExternalPackages: [
    '@opennextjs/cloudflare',
    'better-sqlite3',
    'drizzle-kit',
    '@simplewebauthn/server',
    '@react-email/render',
    '@stripe/stripe-js',
    'arctic',
    'ipaddr.js',
    'ua-parser-js',
  ],
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_LINTER === 'true'
  },
  typescript: {
    ignoreBuildErrors: process.env.SKIP_LINTER === 'true'
  },
  // 针对 Cloudflare Workers 的构建优化 - 减少包大小
  webpack: (config, { isServer, dev }) => {
    // 开发环境保持默认
    if (dev) {
      return config;
    }

    // 生产环境：激进的大小优化
    config.optimization = {
      ...config.optimization,
      splitChunks: false, // 禁用代码分割避免 chunk 错误
      runtimeChunk: false,
      usedExports: true, // 启用 tree-shaking
      sideEffects: false, // 允许更激进的 tree-shaking
    };

    // 外部化大型依赖
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'drizzle-kit',
        'sqlite3',
        // 认证相关大型包
        '@simplewebauthn/server',
        '@oslojs/encoding',
        'arctic',
        // 邮件模板
        '@react-email/render',
        '@react-email/components',
        // 支付相关
        'stripe',
        // 工具库
        'ipaddr.js',
        'ua-parser-js',
        'ms',
        'slugify',
        // UI 相关大型包
        'motion',
      ];
    }

    // 客户端 polyfill 最小化
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
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
};

export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzer()(nextConfig)
  : nextConfig;
