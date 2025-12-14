/**
 * 傷病手当金シミュレーターの型定義
 */

// 入力値の型
export interface SicknessInput {
  salary: number;
  period: number; // 休業期間（月数：1-18ヶ月）
}

// 社会保険料の型
export interface SocialInsurance {
  healthInsurance: number;      // 健康保険料
  pensionInsurance: number;     // 厚生年金保険料
  employmentInsurance: number;  // 雇用保険料（常に0）
  total: number;                // 合計
}

// 現在の収支の型
export interface CurrentIncome {
  grossSalary: number;          // 月額総支給額
  socialInsurance: SocialInsurance;
  incomeTax: number;           // 所得税
  residentTax: number;         // 住民税
  netIncome: number;           // 手取り額（税金・社会保険料差引後）
}

// 支給期間情報の型
export interface PaymentSchedule {
  totalDays: number;            // 休業期間総日数
  actualPaymentDays: number;    // 実際の支給日数（-3日）
  waitingPeriodDays: number;    // 待期期間（3日）
  firstPaymentMonths: number;   // 初回支給までの月数（約1ヶ月）
  followUpPaymentWeeks: number; // 2回目以降支給までの週数（約2週間）
}

// 傷病手当金の型
export interface SicknessBenefit {
  standardMonthlyRemuneration: number; // 標準報酬月額
  standardDailyWage: number;           // 標準報酬日額
  benefitDailyAmount: number;          // 傷病手当金日額
  totalBenefit: number;                // 総支給額
  monthlyBenefit: number;              // 月換算支給額
  netMonthlyBenefit: number;           // 社保料差引後月額手取り
  socialInsurance: SocialInsurance;    // 社会保険料（継続負担）
  incomeTax: number;                   // 所得税（0円、非課税）
  residentTax: number;                 // 住民税（0円、非課税）
}

// 計算結果全体の型
export interface SicknessResult {
  input: SicknessInput;
  current: CurrentIncome;
  benefit: SicknessBenefit;
  schedule: PaymentSchedule;
  maintenanceRate: number;              // 維持率（%）
}

// バリデーションエラーの型
export interface ValidationError {
  field: 'salary' | 'period';
  message: string;
  type: 'error' | 'warning';
}

// InputForm コンポーネントの Props
export interface InputFormProps {
  onCalculate: (input: SicknessInput) => void;
  initialSalary?: number;
  initialPeriod?: number;
}

// ResultDisplay コンポーネントの Props
export interface ResultDisplayProps {
  result: SicknessResult;
}