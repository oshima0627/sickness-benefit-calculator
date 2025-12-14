'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { validateSicknessInput } from '../utils/sicknessCalculator'
import { formatInputNumber, parseFormattedNumber } from '../utils/formatter'
import { DEBOUNCE_TIME } from '../utils/constants'
import type { InputFormProps, ValidationError } from '../types'
import './InputForm.css'

export default function InputForm({ 
  onCalculate, 
  initialSalary = 0, 
  initialPeriod = 6 
}: InputFormProps) {
  const [salary, setSalary] = useState<string>(
    initialSalary > 0 ? formatInputNumber(String(initialSalary)) : ''
  )
  const [period, setPeriod] = useState<number>(initialPeriod || 6)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 計算実行のデバウンス処理
  const executeCalculation = useCallback(() => {
    const numericSalary = parseFormattedNumber(salary)
    const validationErrors = validateSicknessInput(numericSalary, period)
    
    setErrors(validationErrors)
    
    // エラータイプでない場合は計算を実行
    const hasErrors = validationErrors.some(error => error.type === 'error')
    if (!hasErrors && numericSalary > 0) {
      onCalculate({ salary: numericSalary, period })
    }
  }, [salary, period]) // eslint-disable-line react-hooks/exhaustive-deps

  // デバウンス付きの計算実行
  const debouncedCalculate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const numericSalary = parseFormattedNumber(salary)
      const validationErrors = validateSicknessInput(numericSalary, period)
      
      setErrors(validationErrors)
      
      // エラータイプでない場合は計算を実行
      const hasErrors = validationErrors.some(error => error.type === 'error')
      if (!hasErrors && numericSalary > 0) {
        onCalculate({ salary: numericSalary, period })
      }
    }, DEBOUNCE_TIME)
  }, [salary, period]) // eslint-disable-line react-hooks/exhaustive-deps

  // 給与入力の変更処理
  const handleSalaryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSalary(value)
  }

  // 給与入力のブラー処理（フォーカスアウト時の処理）
  const handleSalaryBlur = () => {
    // 空文字や空白のみの場合は何もしない
    if (!salary || !salary.trim()) {
      return
    }
    
    // 数値として解析
    const numericValue = parseFormattedNumber(salary.trim())
    
    // 計算は正の数の場合のみ
    if (numericValue > 0) {
      debouncedCalculate()
    }
  }

  // 期間選択の処理
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPeriod = parseInt(e.target.value, 10)
    setPeriod(selectedPeriod)
  }

  // 初期値が設定されている場合の自動計算
  useEffect(() => {
    if (initialSalary > 0) {
      const numericSalary = parseFormattedNumber(formatInputNumber(String(initialSalary)))
      const validationErrors = validateSicknessInput(numericSalary, period)
      
      setErrors(validationErrors)
      
      // エラータイプでない場合は計算を実行
      const hasErrors = validationErrors.some(error => error.type === 'error')
      if (!hasErrors && numericSalary > 0) {
        onCalculate({ salary: numericSalary, period })
      }
    }
  }, [initialSalary, period]) // eslint-disable-line react-hooks/exhaustive-deps

  // 期間変更時は即座に計算
  useEffect(() => {
    if (salary && parseFormattedNumber(salary) > 0) {
      const numericSalary = parseFormattedNumber(salary)
      const validationErrors = validateSicknessInput(numericSalary, period)
      
      setErrors(validationErrors)
      
      // エラータイプでない場合は計算を実行
      const hasErrors = validationErrors.some(error => error.type === 'error')
      if (!hasErrors && numericSalary > 0) {
        onCalculate({ salary: numericSalary, period })
      }
    }
  }, [period, salary]) // eslint-disable-line react-hooks/exhaustive-deps

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // フィールドごとのエラー取得
  const getFieldError = (fieldName: 'salary' | 'period') => {
    return errors.find(error => error.field === fieldName)
  }

  const salaryError = getFieldError('salary')
  const periodError = getFieldError('period')

  return (
    <section className="input-form">
      <h2>給与情報入力</h2>
      
      <div className="form-group">
        <label htmlFor="salary">
          月額総支給額（円）
          <span className="required">*</span>
        </label>
        <input
          type="number"
          id="salary"
          value={salary}
          onChange={handleSalaryChange}
          onBlur={handleSalaryBlur}
          min="0"
          max="3000000"
          step="1000"
          placeholder="例: 300000"
          aria-label="月額総支給額"
          aria-describedby={salaryError ? 'salary-error' : undefined}
          className={salaryError?.field === 'salary' ? 'has-error' : ''}
        />
        {salaryError && salaryError.field === 'salary' && (
          <p 
            id="salary-error"
            className={`error-message ${salaryError.type}`}
            role="alert"
          >
            {salaryError.message}
          </p>
        )}
        <p className="form-help">
          賞与（ボーナス）は含めず、月額の総支給額を入力してください
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="period">
          休業期間
          <span className="required">*</span>
        </label>
        <select
          id="period"
          value={period}
          onChange={handlePeriodChange}
          className={periodError ? 'has-error' : ''}
        >
          {Array.from({ length: 18 }, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>
              {month}ヶ月
            </option>
          ))}
        </select>
        {periodError && (
          <p className={`error-message ${periodError.type}`} role="alert">
            {periodError.message}
          </p>
        )}
        <p className="form-help">
          傷病手当金を受給する予定期間を選択してください
        </p>
      </div>
      
      <div className="form-status">
        {salary && parseFormattedNumber(salary) > 0 ? (
          <p className="status-message success">
            ✓ 入力完了 - 計算結果が下に表示されます
          </p>
        ) : (
          <p className="status-message info">
            月額総支給額を入力すると自動で計算されます
          </p>
        )}
      </div>
    </section>
  )
}