import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { CreditsProvider } from '@/lib/credits-context'
import './globals.css'

export const metadata: Metadata = {
  title: '秒懂AI超级员工 - 专业AI写作助手',
  description: '专家级AI写作平台，100000+写作模型，一键生成高质量文案、文章、营销内容。让创作更简单，让表达更精彩。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`font-sans antialiased`}>
        <CreditsProvider>
          {children}
        </CreditsProvider>
        <Analytics />
      </body>
    </html>
  )
}
