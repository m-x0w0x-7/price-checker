import { MAX_VALUE, ERROR_MESSAGES } from './constants.js'

/**
 * 入力値を整数に正規化する（フォーカスアウト時に呼ぶ）
 * - 小数はMath.floorで切り捨て
 * - MAX_VALUEを超える値はMAX_VALUEに丸める
 * - 空文字やNaNは空文字を返す
 * @param {string} rawValue
 * @returns {number|''}
 */
export function normalizeInput(rawValue) {
  const trimmed = String(rawValue).trim()
  if (trimmed === '') return ''

  const num = parseFloat(trimmed)
  if (isNaN(num)) return ''

  const floored = Math.floor(num)

  if (floored > MAX_VALUE) return MAX_VALUE

  return floored
}

/**
 * 値をバリデーションしてエラーメッセージを返す
 * - 正常値は空文字
 * - 0 → ERROR_MESSAGES.ZERO
 * - 負数 → ERROR_MESSAGES.NEGATIVE
 * - 空文字 → 空文字（未入力扱い）
 * @param {number|''} value
 * @returns {string} エラーメッセージ（なければ空文字）
 */
export function validateValue(value) {
  if (value === '') return ''
  if (value < 0) return ERROR_MESSAGES.NEGATIVE
  if (value === 0) return ERROR_MESSAGES.ZERO
  return ''
}
