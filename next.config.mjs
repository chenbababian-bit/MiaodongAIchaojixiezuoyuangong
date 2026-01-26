/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 Vercel 图片优化以提升性能
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 配置输出模式为 standalone，适合 Vercel 部署
  output: 'standalone',
}

export default nextConfig
