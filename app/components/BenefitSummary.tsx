import { formatCurrency } from '../utils/formatter'
import type { SicknessBenefit } from '../types'
import './BenefitSummary.css'

interface BenefitSummaryProps {
  benefit: SicknessBenefit
}

export default function BenefitSummary({ benefit }: BenefitSummaryProps) {
  return (
    <div className="benefit-summary">
      <h3 className="section-title">傷病手当金</h3>
      
      <div className="calculation-details">
        <div className="detail-item">
          <span className="detail-label">標準報酬月額</span>
          <span className="detail-value">{formatCurrency(benefit.standardMonthlyRemuneration)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">標準報酬日額</span>
          <span className="detail-value">{formatCurrency(benefit.standardDailyWage)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">傷病手当金日額</span>
          <span className="detail-value">{formatCurrency(benefit.benefitDailyAmount)}</span>
        </div>
      </div>

      <div className="total-benefit">
        <div className="total-item">
          <span className="total-label">総支給額</span>
          <span className="total-value">{formatCurrency(benefit.totalBenefit)}</span>
        </div>
      </div>

      <div className="monthly-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label">傷病手当金（月換算）</span>
          <span className="breakdown-value">{formatCurrency(benefit.monthlyBenefit)}</span>
          <span className="breakdown-note">（非課税）</span>
        </div>
        <div className="breakdown-item deduction">
          <span className="breakdown-label">社会保険料（継続支払い）</span>
          <span className="breakdown-value">
            -{formatCurrency(benefit.socialInsurance.total)}
          </span>
        </div>
        <div className="breakdown-item deduction">
          <span className="breakdown-label">前年度所得ベース税金</span>
          <span className="breakdown-value">
            -{formatCurrency(benefit.incomeTax + benefit.residentTax)}
          </span>
        </div>
        <div className="breakdown-item total">
          <span className="breakdown-label">実質手取り</span>
          <span className="breakdown-value highlight">{formatCurrency(benefit.netMonthlyBenefit)}</span>
        </div>
      </div>

      <div className="tax-info">
        <h4 className="info-title">税制上の取り扱い</h4>
        <ul className="info-list">
          <li>✓ 傷病手当金への所得税：非課税（0円）</li>
          <li>✓ 傷病手当金への住民税：非課税（0円）</li>
          <li>⚠️ 社会保険料：継続支払い（健康保険料・厚生年金保険料）</li>
          <li>✓ 雇用保険料：免除（0円）</li>
        </ul>
        <div className="tax-notice">
          <h5 className="notice-title">⚠️ 重要：休職中の税金負担について</h5>
          <p className="notice-text">
            上記の実質手取りには<strong>前年度所得に基づく税金負担</strong>を含めて計算しています。
            休職中も住民税等の支払い義務があり、実際の家計負担となります。
          </p>
          <ul className="notice-list">
            <li>住民税：前年度所得ベース（6月〜翌年5月分）</li>
            <li>所得税：源泉徴収不足分や予定納税がある場合</li>
            <li>その他：国民健康保険税、固定資産税等の各種税金</li>
          </ul>
          <p className="notice-text">
            ※税金の支払い義務は前年の所得により決まるため、休職のタイミングによって負担が変わります。
          </p>
        </div>
      </div>
    </div>
  )
}