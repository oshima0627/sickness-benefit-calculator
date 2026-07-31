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
            url: 'https://maternity.nexeed-lab.com',
            label: '出産手当金'
          },
          {
            site: 'sickness' as const,
            url: 'https://sickness.nexeed-lab.com',
            label: '傷病手当金'
          }
        ]
      case 'maternity':
        return [
          {
            site: 'childcare' as const,
            url: 'https://childcare.nexeed-lab.com',
            label: '育児休業給付金'
          },
          {
            site: 'sickness' as const,
            url: 'https://sickness.nexeed-lab.com',
            label: '傷病手当金'
          }
        ]
      case 'sickness':
        return [
          {
            site: 'maternity' as const,
            url: 'https://maternity.nexeed-lab.com',
            label: '出産手当金'
          },
          {
            site: 'childcare' as const,
            url: 'https://childcare.nexeed-lab.com',
            label: '育児休業給付金'
          }
        ]
      default:
        return []
    }
  }, [currentSite])

  const handleNavigation = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  return (
    <div className="header-nav">
      {navigationConfig.map((target) => (
        <button 
          key={target.site}
          onClick={() => handleNavigation(target.url)}
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