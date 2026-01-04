'use client'

/**
 * メインページ
 * InputFormを表示し、計算結果を表示する
 */

import { useState } from 'react'
import InputForm from './components/InputForm'
import ResultDisplay from './components/ResultDisplay'
import FAQ from './components/FAQ'
import AffiliateBanner from './components/AffiliateBanner'
import { calculateSickness } from './utils/sicknessCalculator'
import type { SicknessInput, SicknessResult } from './types'

export default function HomePage() {
  const [result, setResult] = useState<SicknessResult | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  /**
   * 計算実行処理
   */
  const handleCalculate = (input: SicknessInput) => {
    try {
      const calculationResult = calculateSickness(input)
      setResult(calculationResult)
      setHasCalculated(true)
      
      // Google Analytics イベント送信（クライアントサイドでのみ実行）
      if (typeof window !== 'undefined') {
        // useEffect や setTimeout を使用してハイドレーション後に実行
        setTimeout(() => {
          if ((window as any).gtag) {
            ;(window as any).gtag('event', 'calculate', {
              event_category: 'engagement',
              event_label: 'sickness_benefit_calculation',
              value: input.salary,
            })
          }
        }, 0)
      }
    } catch (error) {
      console.error('計算エラー:', error)
      setResult(null)
      setHasCalculated(false)
    }
  }

  return (
    <div className="main-content">
      <div className="intro-section">
        <h2>傷病手当金を簡単計算</h2>
        <p className="intro-text">
          月額給与と休業期間を入力するだけで、傷病手当金の手取り額を自動計算。
          現在の手取りとの比較もできます。
        </p>
        <div className="features">
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span>正確な計算</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>視覚的比較</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>スマホ対応</span>
          </div>
        </div>
      </div>

      <InputForm onCalculate={handleCalculate} />

      {hasCalculated && result && (
        <div className="detailed-results">
          <ResultDisplay result={result} />
        </div>
      )}

      {!hasCalculated && (
        <section className="getting-started">
          <h2>使い方</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>月額総支給額を入力</h3>
                <p>賞与を除いた月額の総支給額を入力してください</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>休業期間を選択</h3>
                <p>1ヶ月から18ヶ月までの期間を選択してください</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>結果を確認</h3>
                <p>自動で計算結果が表示されます</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasCalculated && <AffiliateBanner />}

      <FAQ />

      <AffiliateBanner />
    </div>
  )
}