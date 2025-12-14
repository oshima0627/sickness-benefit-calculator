/**
 * 数値を3桁カンマ区切りにフォーマット
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ja-JP');
}

/**
 * 円表示にフォーマット
 */
export function formatCurrency(value: number): string {
  return `${formatNumber(value)}円`;
}

/**
 * パーセント表示にフォーマット
 */
export function formatPercent(value: number): string {
  return `約${value}%`;
}

/**
 * 期間表示をフォーマット（月数）
 */
export function formatPeriodMonths(months: number): string {
  return `${months}ヶ月`;
}

/**
 * 期間表示をフォーマット（日数）
 */
export function formatPeriodDays(days: number): string {
  return `${days}日間`;
}

/**
 * カンマ区切り文字列を数値に変換
 */
export function parseFormattedNumber(value: string): number {
  if (typeof value !== 'string') {
    return 0;
  }
  const cleanValue = value.replace(/[,\s]/g, '');
  const parsed = parseInt(cleanValue, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 入力値を数値にフォーマット(入力フィールド用)
 */
export function formatInputNumber(value: string, allowEmpty = false): string {
  // 空文字の場合
  if (value === '' || value.trim() === '') {
    return allowEmpty ? '' : '';
  }
  
  const numericValue = parseFormattedNumber(value);
  
  // 有効な数値が入力されている場合は、0でもフォーマットして返す
  if (!isNaN(numericValue) && value.trim() !== '') {
    return formatNumber(numericValue);
  }
  
  // 無効な入力の場合は空文字を返す
  return '';
}