import { formatCurrency, formatPercent } from '../utils/formatter'
import type { CurrentIncome, SicknessBenefit } from '../types'
import './IncomeComparison.css'

interface IncomeComparisonProps {
  current: CurrentIncome
  benefit: SicknessBenefit
  maintenanceRate: number
}

export default function IncomeComparison({ 
  current, 
  benefit, 
  maintenanceRate 
}: IncomeComparisonProps) {
  const currentNetIncome = current.netIncome
  const benefitNetIncome = benefit.netMonthlyBenefit

  return (
    <div className="income-comparison">
      <h3 className="section-title">収入比較</h3>
      
      <div className="comparison-chart">
        <div className="chart-item current">
          <div className="chart-label">
            <span className="label-text">通常時の手取り</span>
            <span className="label-amount">{formatCurrency(currentNetIncome)}</span>
          </div>
          <div className="chart-bar">
            <div 
              className="bar current-bar"
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="chart-percentage">100%</div>
        </div>

        <div className="chart-item benefit">
          <div className="chart-label">
            <span className="label-text">傷病手当時の手取り</span>
            <span className="label-amount">{formatCurrency(benefitNetIncome)}</span>
          </div>
          <div className="chart-bar">
            <div 
              className="bar benefit-bar"
              style={{ width: `${maintenanceRate}%` }}
            ></div>
          </div>
          <div className="chart-percentage">{formatPercent(maintenanceRate)}</div>
        </div>
      </div>

      <div className="comparison-summary">
        <div className="summary-item">
          <span className="summary-label">収入維持率</span>
          <span className={`summary-value ${maintenanceRate >= 70 ? 'good' : maintenanceRate >= 50 ? 'fair' : 'low'}`}>
            {formatPercent(maintenanceRate)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">月額減少額</span>
          <span className="summary-value decrease">
            {formatCurrency(currentNetIncome - benefitNetIncome)}
          </span>
        </div>
      </div>

      <div className="current-breakdown">
        <h4 className="breakdown-title">通常時の収支内訳</h4>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="item-label">月額総支給額</span>
            <span className="item-value">{formatCurrency(current.grossSalary)}</span>
          </div>
          <div className="breakdown-item deduction">
            <span className="item-label">健康保険料</span>
            <span className="item-value">-{formatCurrency(current.socialInsurance.healthInsurance)}</span>
          </div>
          <div className="breakdown-item deduction">
            <span className="item-label">厚生年金保険料</span>
            <span className="item-value">-{formatCurrency(current.socialInsurance.pensionInsurance)}</span>
          </div>
          <div className="breakdown-item deduction">
            <span className="item-label">雇用保険料</span>
            <span className="item-value">-{formatCurrency(current.socialInsurance.employmentInsurance)}</span>
          </div>
          <div className="breakdown-item deduction">
            <span className="item-label">所得税（概算）</span>
            <span className="item-value">-{formatCurrency(current.incomeTax)}</span>
          </div>
          <div className="breakdown-item deduction">
            <span className="item-label">住民税（概算）</span>
            <span className="item-value">-{formatCurrency(current.residentTax)}</span>
          </div>
          <div className="breakdown-item total">
            <span className="item-label">手取り額</span>
            <span className="item-value">{formatCurrency(currentNetIncome)}</span>
          </div>
        </div>
        <p className="breakdown-note">
          ※税金計算は概算です。実際の税額は各種控除により変動します。詳しくはFAQをご確認ください。
        </p>
      </div>
    </div>
  )
}