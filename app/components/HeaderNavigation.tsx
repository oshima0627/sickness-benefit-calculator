'use client'

/**
 * ヘッダーナビゲーション
 * サイト間遷移ボタン（複数対応）
 */

import './HeaderNavigation.css'

interface NavigationTarget {
  site: 'childcare' | 'maternity'
  url: string
  label: string
}

interface HeaderNavigationProps {
  targets: NavigationTarget[]
}

export default function HeaderNavigation({
  targets
}: HeaderNavigationProps) {
  const handleNavigation = (target: NavigationTarget) => {
    if (typeof window !== 'undefined') {
      // Google Analytics tracking
      if ((window as any).gtag) {
        (window as any).gtag('event', 'site_navigation', {
          'event_category': 'Navigation',
          'event_label': `sickness_to_${target.site}`
        })
      }
      
      // Navigate to target URL
      window.open(target.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="header-nav">
      {targets.map((target) => (
        <button 
          key={target.site}
          onClick={() => handleNavigation(target)}
          className="header-nav-button"
          type="button"
          aria-label={`${target.label}に移動`}
        >
          {target.label}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ))}
    </div>
  )
}