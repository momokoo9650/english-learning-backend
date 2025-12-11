import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EchoTube - 英语学习平台',
  description: '通过视频学习英语，AI 智能生成关键词卡片',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
