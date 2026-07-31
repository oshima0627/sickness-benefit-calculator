import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cloudflare（Workers 静的アセット / Pages）へ配信するため静的HTMLを書き出す
  // ビルド成果物は out/ に出力される
  output: 'export',

  // 静的エクスポートでは Next.js の画像最適化サーバーが使えないため無効化
  images: {
    unoptimized: true,
  },

  compiler: {
    styledJsx: false,
  },
}

export default nextConfig
