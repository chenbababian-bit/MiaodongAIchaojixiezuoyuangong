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
}

export default nextConfig
