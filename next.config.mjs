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
  // Vercel 会自动处理部署，不需要 standalone 模式
}

export default nextConfig
