import { formatPeriodMonths, formatPeriodDays } from '../utils/formatter'
import { PAYMENT_SCHEDULE_INFO } from '../utils/constants'
import type { PaymentSchedule as PaymentScheduleType } from '../types'
import './PaymentSchedule.css'

interface PaymentScheduleProps {
  schedule: PaymentScheduleType
  periodMonths: number
}

export default function PaymentSchedule({ schedule, periodMonths }: PaymentScheduleProps) {
  return (
    <div className="payment-schedule">
      <h3 className="section-title">支給スケジュール</h3>
      
      <div className="schedule-grid">
        <div className="schedule-item first-payment">
          <div className="schedule-icon">⏰</div>
          <div className="schedule-content">
            <div className="schedule-label">初回支給</div>
            <div className="schedule-value">申請から{PAYMENT_SCHEDULE_INFO.firstPayment.period}</div>
            <div className="schedule-description">{PAYMENT_SCHEDULE_INFO.firstPayment.description}</div>
          </div>
        </div>
        
        <div className="schedule-item followup-payment">
          <div className="schedule-icon">🔄</div>
          <div className="schedule-content">
            <div className="schedule-label">2回目以降</div>
            <div className="schedule-value">申請から{PAYMENT_SCHEDULE_INFO.followUpPayment.period}</div>
            <div className="schedule-description">{PAYMENT_SCHEDULE_INFO.followUpPayment.description}</div>
          </div>
        </div>
      </div>

      <div className="waiting-period">
        <h4 className="waiting-title">待期期間について</h4>
        <p className="waiting-description">
          療養開始から<strong>{formatPeriodDays(schedule.waitingPeriodDays)}</strong>は支給対象外です。
          4日目から支給が開始されます。
        </p>
      </div>

      <div className="payment-period">
        <div className="period-item">
          <span className="period-label">休業期間：</span>
          <span className="period-value">{formatPeriodMonths(periodMonths)}（{formatPeriodDays(schedule.totalDays)}）</span>
        </div>
        <div className="period-item">
          <span className="period-label">実際の支給日数：</span>
          <span className="period-value highlight">{formatPeriodDays(schedule.actualPaymentDays)}</span>
        </div>
      </div>

      <div className="notice-box">
        <h5 className="notice-title">⚠️ 支給が遅れる可能性</h5>
        <ul className="notice-list">
          {PAYMENT_SCHEDULE_INFO.delays.map((delay, index) => (
            <li key={index}>{delay}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}