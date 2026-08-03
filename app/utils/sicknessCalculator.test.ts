import { describe, it, expect } from 'vitest';
import { calculateSickness, validateSicknessInput } from './sicknessCalculator';
import { STANDARD_MONTHLY_REMUNERATION_TABLE, SICKNESS_CONSTANTS } from './constants';
import type { SicknessInput } from '../types';

function input(overrides: Partial<SicknessInput> = {}): SicknessInput {
  return { salary: 300_000, period: 6, ...overrides };
}

describe('標準報酬月額の等級判定', () => {
  // 健康保険の標準報酬月額表は、隣り合う等級の中間値が境界になっている。
  // 例: 58,000 と 68,000 の境界は 63,000（63,000 未満は 58,000 等級）。
  it('隣接する等級の中間値が境界になる', () => {
    const grade = (salary: number) =>
      calculateSickness(input({ salary })).benefit.standardMonthlyRemuneration;

    expect(grade(62_999)).toBe(58_000);
    expect(grade(63_000)).toBe(68_000);
    expect(grade(72_999)).toBe(68_000);
    expect(grade(73_000)).toBe(78_000);
  });

  it('表の下限を下回る場合は最低等級に丸める', () => {
    expect(calculateSickness(input({ salary: 1 })).benefit.standardMonthlyRemuneration).toBe(58_000);
  });

  it('表の上限を超える場合は最高等級で頭打ちになる', () => {
    const max = STANDARD_MONTHLY_REMUNERATION_TABLE[STANDARD_MONTHLY_REMUNERATION_TABLE.length - 1];

    expect(calculateSickness(input({ salary: max * 3 })).benefit.standardMonthlyRemuneration).toBe(max);
  });

  it('判定結果は必ず等級表に載っている値になる', () => {
    for (let salary = 50_000; salary <= 1_500_000; salary += 7_331) {
      const { standardMonthlyRemuneration } = calculateSickness(input({ salary })).benefit;
      expect(STANDARD_MONTHLY_REMUNERATION_TABLE).toContain(standardMonthlyRemuneration);
    }
  });
});

describe('傷病手当金の日額', () => {
  it('標準報酬日額は標準報酬月額の30分の1', () => {
    const { benefit } = calculateSickness(input({ salary: 300_000 }));

    expect(benefit.standardMonthlyRemuneration).toBe(300_000);
    expect(benefit.standardDailyWage).toBe(10_000);
  });

  it('支給日額は標準報酬日額の3分の2（円未満切り捨て）', () => {
    const { benefit } = calculateSickness(input({ salary: 300_000 }));

    expect(benefit.benefitDailyAmount).toBe(6_666);
  });

  it('月換算額は日額×30', () => {
    const { benefit } = calculateSickness(input({ salary: 300_000 }));

    expect(benefit.monthlyBenefit).toBe(benefit.benefitDailyAmount * 30);
  });
});

describe('待期期間と支給日数', () => {
  it('待期期間は3日間で、その分は支給対象外', () => {
    const { schedule } = calculateSickness(input({ period: 6 }));

    expect(schedule.waitingPeriodDays).toBe(3);
    expect(schedule.totalDays).toBe(6 * 30);
    expect(schedule.actualPaymentDays).toBe(6 * 30 - 3);
  });

  it('休業期間が変わっても待期3日は一度だけ差し引かれる', () => {
    for (const period of [1, 3, 12, 18]) {
      const { schedule } = calculateSickness(input({ period }));
      expect(schedule.totalDays - schedule.actualPaymentDays).toBe(
        SICKNESS_CONSTANTS.WAITING_PERIOD_DAYS,
      );
    }
  });

  it('支給総額 = 日額 × 実支給日数', () => {
    const { benefit, schedule } = calculateSickness(input({ salary: 300_000, period: 6 }));

    expect(benefit.totalBenefit).toBe(benefit.benefitDailyAmount * schedule.actualPaymentDays);
  });

  it('休業期間が長いほど支給総額が増える', () => {
    const short = calculateSickness(input({ period: 3 })).benefit.totalBenefit;
    const long = calculateSickness(input({ period: 12 })).benefit.totalBenefit;

    expect(long).toBeGreaterThan(short);
  });
});

describe('受給中の手取り', () => {
  it('休職中は雇用保険料が発生しない', () => {
    const { benefit } = calculateSickness(input({ salary: 300_000 }));

    expect(benefit.socialInsurance.employmentInsurance).toBe(0);
  });

  it('健康保険料・厚生年金保険料は受給中も発生する', () => {
    const { benefit } = calculateSickness(input({ salary: 300_000 }));

    expect(benefit.socialInsurance.healthInsurance).toBeGreaterThan(0);
    expect(benefit.socialInsurance.pensionInsurance).toBeGreaterThan(0);
    expect(benefit.socialInsurance.total).toBe(
      benefit.socialInsurance.healthInsurance + benefit.socialInsurance.pensionInsurance,
    );
  });

  it('前年所得ベースの住民税は受給中も差し引かれる', () => {
    // 休業しても前年所得に対する住民税の納付義務は残る。
    const { benefit } = calculateSickness(input({ salary: 300_000 }));

    expect(benefit.residentTax).toBeGreaterThan(0);
    expect(benefit.netMonthlyBenefit).toBe(
      benefit.monthlyBenefit - benefit.socialInsurance.total - benefit.incomeTax - benefit.residentTax,
    );
  });

  it('受給中の手取りは月換算支給額より小さい', () => {
    const { benefit } = calculateSickness(input({ salary: 300_000 }));

    expect(benefit.netMonthlyBenefit).toBeLessThan(benefit.monthlyBenefit);
  });

  it('維持率は受給中の手取りと通常時の手取りの比率', () => {
    const result = calculateSickness(input({ salary: 300_000 }));

    expect(result.maintenanceRate).toBe(
      Math.round((result.benefit.netMonthlyBenefit / result.current.netIncome) * 100),
    );
    expect(result.maintenanceRate).toBeGreaterThan(0);
    expect(result.maintenanceRate).toBeLessThan(100);
  });
});

describe('通常時の収支', () => {
  it('手取りは額面より小さい', () => {
    const { current } = calculateSickness(input({ salary: 300_000 }));

    expect(current.grossSalary).toBe(300_000);
    expect(current.netIncome).toBeLessThan(300_000);
    expect(current.netIncome).toBeGreaterThan(0);
  });

  it('手取り = 額面 - 社会保険料 - 所得税 - 住民税', () => {
    const { current } = calculateSickness(input({ salary: 300_000 }));

    expect(current.netIncome).toBe(
      current.grossSalary - current.socialInsurance.total - current.incomeTax - current.residentTax,
    );
  });

  it('給与が上がれば支給総額も下がらない（単調非減少）', () => {
    let previous = 0;
    for (let salary = 58_000; salary <= 1_400_000; salary += 11_113) {
      const { benefit } = calculateSickness(input({ salary }));
      expect(benefit.totalBenefit).toBeGreaterThanOrEqual(previous);
      previous = benefit.totalBenefit;
    }
  });
});

describe('validateSicknessInput', () => {
  it('正しい入力ならエラーなし', () => {
    expect(validateSicknessInput(300_000, 6)).toEqual([]);
  });

  it('給与未入力はエラー', () => {
    expect(validateSicknessInput(0, 6)).toContainEqual(
      expect.objectContaining({ field: 'salary', type: 'error' }),
    );
  });

  it('給与が低すぎる場合は警告（エラーではない）', () => {
    const errors = validateSicknessInput(50_000, 6);
    expect(errors.find((e) => e.field === 'salary')?.type).toBe('warning');
  });

  it('給与が高すぎる場合はエラー', () => {
    expect(validateSicknessInput(5_000_000, 6)).toContainEqual(
      expect.objectContaining({ field: 'salary', type: 'error' }),
    );
  });

  it('休業期間は1〜18ヶ月の範囲内', () => {
    // 支給上限は通算1年6ヶ月。
    expect(validateSicknessInput(300_000, 1)).toEqual([]);
    expect(validateSicknessInput(300_000, 18)).toEqual([]);
  });

  it('範囲外・非整数の休業期間はエラー', () => {
    for (const period of [0, -1, 19, 6.5]) {
      expect(validateSicknessInput(300_000, period)).toContainEqual(
        expect.objectContaining({ field: 'period', type: 'error' }),
      );
    }
  });
});
