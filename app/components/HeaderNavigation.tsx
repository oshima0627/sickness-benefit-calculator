import './HeaderNavigation.css'

/**
 * ヘッダーナビゲーション
 * 姉妹サイトへの遷移
 *
 * 以前は <button onClick={window.open}> でサイト間を移動していたが、
 * これは検索エンジンにとってリンクではない。クロールの経路にならず、
 * サイト間で評価も渡らないため、相互リンクとして機能していなかった。
 * 実際に配信HTMLを調べたところ、3サイト間の <a href> は0本だった。
 *
 * 素の <a> に置き換えている。onClick が不要になったので 'use client' も外した
 * （クライアントJSを送らずに済む）。CSS は text-decoration: none 済みなので
 * 見た目は変わらない。
 */

const SITES = {
  childcare: {
    url: 'https://childcare.nexeed-lab.com',
    label: '育児休業給付金',
  },
  maternity: {
    url: 'https://maternity.nexeed-lab.com',
    label: '出産手当金',
  },
  sickness: {
    url: 'https://sickness.nexeed-lab.com',
    label: '傷病手当金',
  },
  ikunavi: {
    url: 'https://ikunavi.nexeed-lab.com',
    label: '育休ナビ',
  },
} as const

type SiteKey = keyof typeof SITES

/** 計算ツール3つ → 制度の解説サイトの順。自分自身は除く。 */
const ORDER: SiteKey[] = ['childcare', 'maternity', 'sickness', 'ikunavi']

interface HeaderNavigationProps {
  currentSite: 'childcare' | 'maternity' | 'sickness'
}

export default function HeaderNavigation({ currentSite }: HeaderNavigationProps) {
  const targets = ORDER.filter((key) => key !== currentSite)

  return (
    <div className="header-nav">
      {targets.map((key) => {
        const site = SITES[key]
        return (
          <a
            key={key}
            href={site.url}
            target="_blank"
            rel="noopener"
            className="header-nav-button"
            aria-label={
              key === 'ikunavi'
                ? '育休ナビ（制度の解説）を開く'
                : `${site.label}シミュレーターに移動`
            }
          >
            {site.label}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8H13M13 8L8 3M13 8L8 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )
      })}
    </div>
  )
}
