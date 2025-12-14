import type { Metadata } from 'next'
import './globals.css'
import { APP_CONFIG, OGP_CONFIG } from './utils/constants'
import { Analytics } from '@vercel/analytics/next'
import HeaderNavigation from './components/HeaderNavigation'

export const metadata: Metadata = {
  title: OGP_CONFIG.title,
  description: OGP_CONFIG.description,
  keywords: [
    '傷病手当金',
    'シミュレーター',
    '手取り',
    '計算',
    '病気',
    '怪我',
    '休職',
    '給付金',
    '健康保険',
    '社会保険',
    '厚生年金',
    '雇用保険',
    '休業',
    '労働基準法',
    '社会保障',
  ],
  authors: [{ name: 'Sickness Benefit Calculator' }],
  creator: 'Sickness Benefit Calculator',
  publisher: 'Sickness Benefit Calculator',
  openGraph: {
    type: 'website',
    siteName: OGP_CONFIG.siteName,
    title: OGP_CONFIG.title,
    description: OGP_CONFIG.description,
    locale: 'ja_JP',
    url: APP_CONFIG.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: OGP_CONFIG.title,
    description: OGP_CONFIG.description,
    site: '@sickness_calc',
    creator: '@sickness_calc',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: APP_CONFIG.url,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2196f3" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={APP_CONFIG.url} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="傷病手当金シミュレーター" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap&subset=japanese"
        />
        {APP_CONFIG.gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${APP_CONFIG.gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <div className="app">
          <header>
            <div className="container">
              <h1>{APP_CONFIG.title}</h1>
              <p className="subtitle">
                病気・ケガで休職予定の方向け 手取り額シミュレーター
              </p>
              <HeaderNavigation currentSite="sickness" />
            </div>
          </header>

          <main>
            <div className="container">
              {children}
            </div>
          </main>

          <footer>
            <div className="container">
              <div className="footer-content">
                <div className="footer-section">
                  <h3>免責事項</h3>
                  <p>
                    当サイトの計算結果はあくまで概算であり、実際の支給額を保証するものではありません。
                    正確な金額については、必ず勤務先の人事担当者または加入している健康保険組合・協会けんぽにご確認ください。
                  </p>
                  <p>
                    当サイトの利用により生じたいかなる損害についても、当方は一切の責任を負いかねます。
                  </p>
                </div>
                
                <div className="footer-section">
                  <h3>注意事項</h3>
                  <p>
                    • 計算結果は令和7年度の制度に基づきます<br />
                    • 健康保険料率は全国平均10%を使用しています<br />
                    • 最新の情報は厚生労働省・健康保険組合でご確認ください
                  </p>
                </div>
              </div>
              
              <div className="footer-bottom">
                <p>
                  &copy; 2025 傷病手当金シミュレーター. 
                  データ出典: 厚生労働省
                </p>
              </div>
            </div>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  )
}