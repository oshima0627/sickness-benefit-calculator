import PaymentSchedule from './PaymentSchedule'
import BenefitSummary from './BenefitSummary'
import IncomeComparison from './IncomeComparison'
import type { ResultDisplayProps } from '../types'

export default function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <div className="result-display">
      <PaymentSchedule 
        schedule={result.schedule} 
        periodMonths={result.input.period}
      />
      
      <BenefitSummary benefit={result.benefit} />
      
      <IncomeComparison 
        current={result.current}
        benefit={result.benefit}
        maintenanceRate={result.maintenanceRate}
      />
    </div>
  )
}