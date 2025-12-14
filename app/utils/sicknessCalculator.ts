/**
 * 傷病手当金計算ロジック
 * 厚生労働省の公式な計算方法に基づく
 */

import {
  STANDARD_MONTHLY_REMUNERATION_TABLE,
  INSURANCE_RATES,
  TAX_CONSTANTS,
  SICKNESS_CONSTANTS,
  PAYMENT_SCHEDULE_INFO,
} from './constants';
import type {
  SicknessInput,
  SicknessResult,
  CurrentIncome,
  SicknessBenefit,
  PaymentSchedule,
  SocialInsurance,
  ValidationError,
} from '../types';

/**
 * 標準報酬月額を取得
 * 月額総支給額を標準報酬月額等級表から最も近い等級に変換
 */
function getStandardMonthlyRemuneration(salary: number): number {
  // 最小値より小さい場合
  if (salary < STANDARD_MONTHLY_REMUNERATION_TABLE[0]) {
    return STANDARD_MONTHLY_REMUNERATION_TABLE[0];
  }
  
  // 最大値より大きい場合
  const maxRemuneration = STANDARD_MONTHLY_REMUNERATION_TABLE[
    STANDARD_MONTHLY_REMUNERATION_TABLE.length - 1
  ];
  if (salary >= maxRemuneration) {
    return maxRemuneration;
  }
  
  // 該当する等級を探す
  for (let i = 0; i < STANDARD_MONTHLY_REMUNERATION_TABLE.length - 1; i++) {
    const current = STANDARD_MONTHLY_REMUNERATION_TABLE[i];
    const next = STANDARD_MONTHLY_REMUNERATION_TABLE[i + 1];
    
    // 現在の等級と次の等級の中間値
    const midpoint = (current + next) / 2;
    
    if (salary < midpoint) {
      return current;
    }
  }
  
  return maxRemuneration;
}

/**
 * 社会保険料を計算（40歳未満固定）
 */
function calculateSocialInsurance(salary: number): SocialInsurance {
  const standardRemuneration = getStandardMonthlyRemuneration(salary);
  
  // 健康保険料(労働者負担分)
  const healthInsurance = Math.floor(
    standardRemuneration * INSURANCE_RATES.health / 2
  );
  
  // 厚生年金保険料(労働者負担分)
  const pensionInsurance = Math.floor(
    standardRemuneration * INSURANCE_RATES.pension / 2
  );
  
  // 雇用保険料(休職中は免除のため0)
  const employmentInsurance = 0;
  
  const total = healthInsurance + pensionInsurance + employmentInsurance;
  
  return {
    healthInsurance,
    pensionInsurance,
    employmentInsurance,
    total,
  };
}

/**
 * 給与所得控除を計算
 */
function calculateSalaryDeduction(annualSalary: number): number {
  for (const range of TAX_CONSTANTS.salaryDeductionRanges) {
    if (annualSalary <= range.max) {
      if (range.fixed !== undefined) {
        return range.fixed;
      } else {
        return Math.floor(annualSalary * range.rate - range.deduction);
      }
    }
  }
  return 1950000; // 上限
}

/**
 * 所得税を計算（復興特別所得税含む）
 */
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  
  for (const range of TAX_CONSTANTS.incomeTaxRanges) {
    if (taxableIncome <= range.max) {
      const tax = Math.floor(taxableIncome * range.rate - range.deduction);
      // 復興特別所得税（2.1%）を加算
      return Math.floor(tax * 1.021);
    }
  }
  
  // ここには到達しないはずだが、念のため
  const maxRange = TAX_CONSTANTS.incomeTaxRanges[TAX_CONSTANTS.incomeTaxRanges.length - 1];
  const tax = Math.floor(taxableIncome * maxRange.rate - maxRange.deduction);
  return Math.floor(tax * 1.021);
}

/**
 * 税金を計算（正確な計算）
 * 給与所得控除・社会保険料控除・基礎控除を考慮した正確な計算
 */
function calculateTax(salary: number, socialInsurance: SocialInsurance): { incomeTax: number; residentTax: number } {
  const annualSalary = salary * 12;
  const annualSocialInsurance = socialInsurance.total * 12;
  
  // 1. 給与所得の計算
  const salaryDeduction = calculateSalaryDeduction(annualSalary);
  const salaryIncome = Math.max(0, annualSalary - salaryDeduction);
  
  // 2. 所得控除の計算
  const totalDeductions = TAX_CONSTANTS.basicDeduction + annualSocialInsurance;
  
  // 3. 課税所得の計算（所得税）
  const taxableIncomeForIncomeTax = Math.max(0, salaryIncome - totalDeductions);
  
  // 4. 所得税の計算
  const annualIncomeTax = calculateIncomeTax(taxableIncomeForIncomeTax);
  
  // 5. 住民税の計算
  // 住民税の基礎控除は所得税より5万円少ない
  const residentTaxDeductions = TAX_CONSTANTS.residentBasicDeduction + annualSocialInsurance;
  const taxableIncomeForResidentTax = Math.max(0, salaryIncome - residentTaxDeductions);
  
  // 住民税 = 均等割 + 所得割
  const annualResidentTax = TAX_CONSTANTS.residentEqualTax + 
    Math.floor(taxableIncomeForResidentTax * TAX_CONSTANTS.residentIncomeRate);
  
  // 月額に変換
  const monthlyIncomeTax = Math.floor(annualIncomeTax / 12);
  const monthlyResidentTax = Math.floor(annualResidentTax / 12);
  
  return {
    incomeTax: monthlyIncomeTax,
    residentTax: monthlyResidentTax,
  };
}

/**
 * 現在の収支を計算（所得税・住民税含む）
 */
function calculateCurrentIncome(salary: number): CurrentIncome {
  const socialInsurance = calculateSocialInsurance(salary);
  const tax = calculateTax(salary, socialInsurance);
  
  const netIncome = salary - socialInsurance.total - tax.incomeTax - tax.residentTax;
  
  return {
    grossSalary: salary,
    socialInsurance,
    incomeTax: tax.incomeTax,
    residentTax: tax.residentTax,
    netIncome,
  };
}

/**
 * 支給期間情報を計算
 */
function calculatePaymentSchedule(periodMonths: number): PaymentSchedule {
  const totalDays = periodMonths * 30; // 月数を日数に変換
  const actualPaymentDays = totalDays - SICKNESS_CONSTANTS.WAITING_PERIOD_DAYS;
  
  return {
    totalDays,
    actualPaymentDays,
    waitingPeriodDays: SICKNESS_CONSTANTS.WAITING_PERIOD_DAYS,
    firstPaymentMonths: SICKNESS_CONSTANTS.FIRST_PAYMENT_MONTHS,
    followUpPaymentWeeks: SICKNESS_CONSTANTS.FOLLOWUP_PAYMENT_WEEKS,
  };
}

/**
 * 傷病手当金受給中の手取りを計算
 */
function calculateSicknessBenefit(
  salary: number, 
  schedule: PaymentSchedule
): SicknessBenefit {
  const standardRemuneration = getStandardMonthlyRemuneration(salary);
  
  // 標準報酬日額 = 標準報酬月額 ÷ 30
  const standardDailyWage = Math.floor(standardRemuneration / 30);
  
  // 傷病手当金日額 = 標準報酬日額 × 2/3
  const benefitDailyAmount = Math.floor(
    standardDailyWage * SICKNESS_CONSTANTS.BENEFIT_RATE
  );
  
  // 総支給額 = 傷病手当金日額 × 実際の支給日数
  const totalBenefit = benefitDailyAmount * schedule.actualPaymentDays;
  
  // 月換算支給額（30日で計算）
  const monthlyBenefit = Math.floor(benefitDailyAmount * 30);
  
  // 傷病手当金受給中の負担
  const socialInsurance = calculateSocialInsurance(salary);
  
  // 休職中でも前年所得に基づく税金支払い義務がある
  // 実際の家計負担を考慮した手取り計算のため、通常時の税金を参考値として計算
  const currentIncome = calculateCurrentIncome(salary);
  const incomeTax = currentIncome.incomeTax; // 前年所得ベースの所得税（参考）
  const residentTax = currentIncome.residentTax; // 前年所得ベースの住民税
  
  // 実質手取り額（傷病手当金 - 社会保険料 - 前年度所得ベースの税金）
  const netMonthlyBenefit = monthlyBenefit - socialInsurance.total - incomeTax - residentTax;
  
  return {
    standardMonthlyRemuneration: standardRemuneration,
    standardDailyWage,
    benefitDailyAmount,
    totalBenefit,
    monthlyBenefit,
    netMonthlyBenefit,
    socialInsurance,
    incomeTax,
    residentTax,
  };
}

/**
 * メイン計算関数
 */
export function calculateSickness(input: SicknessInput): SicknessResult {
  const current = calculateCurrentIncome(input.salary);
  const schedule = calculatePaymentSchedule(input.period);
  const benefit = calculateSicknessBenefit(input.salary, schedule);
  
  // 維持率を計算（現在の手取りに対する傷病手当金の割合）
  const maintenanceRate = Math.round(
    (benefit.netMonthlyBenefit / current.netIncome) * 100
  );
  
  return {
    input,
    current,
    benefit,
    schedule,
    maintenanceRate,
  };
}

/**
 * 入力値のバリデーション
 */
export function validateSicknessInput(
  salary: number, 
  period: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // 給与のバリデーション
  if (!salary || salary === 0) {
    errors.push({
      field: 'salary',
      message: '月額総支給額を入力してください',
      type: 'error',
    });
  } else if (salary < 100000) {
    errors.push({
      field: 'salary',
      message: '金額が低すぎます。傷病手当金の受給要件を満たさない可能性があります',
      type: 'warning',
    });
  } else if (salary > 3000000) {
    errors.push({
      field: 'salary',
      message: '金額が高すぎます。入力内容をご確認ください',
      type: 'error',
    });
  }
  
  // 期間のバリデーション
  if (!period || period < 1 || period > 18 || !Number.isInteger(period)) {
    errors.push({
      field: 'period',
      message: '休業期間は1ヶ月から18ヶ月の範囲で選択してください',
      type: 'error',
    });
  }
  
  return errors;
}