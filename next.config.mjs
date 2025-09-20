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
  // 针对 Cloudflare Workers 的构建优化
  webpack: (config, { isServer, dev }) => {
    // 开发环境保持简单配置
    if (dev) {
      return config;
    }

    // 生产环境针对 Cloudflare Workers 优化
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000, // Cloudflare Workers 建议的最大 chunk 大小
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 244000,
          },
          // 为大型 UI 库创建单独的 chunk
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@heroui|lucide-react)[\\/]/,
            name: 'ui',
            priority: 10,
            chunks: 'all',
            maxSize: 244000,
          },
        },
      },
      // 禁用 runtime chunk 以简化部署
      runtimeChunk: false,
    };

    // Cloudflare Workers 环境的 polyfill 配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
      };
    }

    // 减少模块解析复杂度
    config.resolve.modules = ['node_modules'];
    
    return config;
  },
  // 针对 Cloudflare 的输出优化
  output: 'standalone',
  // 禁用静态优化以避免 Context 问题
  generateStaticParams: false,
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
