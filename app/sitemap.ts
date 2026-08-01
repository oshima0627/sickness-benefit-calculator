import type { MetadataRoute } from 'next'
import { APP_CONFIG } from './utils/constants'

// 静的エクスポート（output: 'export'）でも out/sitemap.xml として書き出される
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
