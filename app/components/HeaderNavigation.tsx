'use client'

/**
 * ヘッダーナビゲーション
 * サイト間遷移ボタン（3つのシミュレーター対応）
 */

import { useCallback, useMemo } from 'react'
import './HeaderNavigation.css'

interface HeaderNavigationProps {
  currentSite: 'childcare' | 'maternity' | 'sickness'
}

export default function HeaderNavigation({
  currentSite
}: HeaderNavigationProps) {
  
  // 静的な情報でHydrationエラーを回避
  const navigationConfig = useMemo(() => {
    switch (currentSite) {
      case 'childcare':
        return [
          {
            site: 'maternity' as const,
            url: 'https://maternity-allowance-calculator.nexeed-web.com',
            label: '出産手当金'
          },
          {
            site: 'sickness' as const,
            url: 'https://sickness-benefit-calculator.nexeed-web.com',
            label: '傷病手当金'
          }
        ]
      case 'maternity':
        return [
          {
            site: 'childcare' as const,
            url: 'https://childcare-calculator.nexeed-web.com',
            label: '育児休業給付金'
          },
          {
            site: 'sickness' as const,
            url: 'https://sickness-benefit-calculator.nexeed-web.com',
            label: '傷病手当金'
          }
        ]
      case 'sickness':
        return [
          {
            site: 'maternity' as const,
            url: 'https://maternity-allowance-calculator.nexeed-web.com',
            label: '出産手当金'
          },
          {
            site: 'childcare' as const,
            url: 'https://childcare-calculator.nexeed-web.com',
            label: '育児休業給付金'
          }
        ]
      default:
        return []
    }
  }, [currentSite])

  const handleNavigation = useCallback((url: string, targetSite: string) => {
    // Google Analytics tracking
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'site_navigation', {
          'event_category': 'Navigation',
          'event_label': `${currentSite}_to_${targetSite}`
        })
      }
    } catch (error) {
      console.log('Analytics tracking failed:', error)
    }
    
    // Navigate to target URL
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [currentSite])

  return (
    <div className="header-nav">
      {navigationConfig.map((target) => (
        <button 
          key={target.site}
          onClick={() => handleNavigation(target.url, target.site)}
          className="header-nav-button"
          type="button"
          aria-label={`${target.label}シミュレーターに移動`}
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