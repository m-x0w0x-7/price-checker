import { normalizeInput, validateValue } from '../src/js/validation.js'
import { ERROR_MESSAGES } from '../src/js/constants.js'

describe('validation', () => {
  describe('normalizeInput — フォーカスアウト時の整数化', () => {
    it('整数はそのまま返す', () => {
      expect(normalizeInput('100')).toBe(100)
    })

    it('小数は切り捨てて整数にする', () => {
      expect(normalizeInput('3.7')).toBe(3)
    })

    it('小数切り捨て後に 0 になる場合は 0 を返す（0.9 → 0）', () => {
      expect(normalizeInput('0.9')).toBe(0)
    })

    it('空文字は空文字を返す', () => {
      expect(normalizeInput('')).toBe('')
    })

    it('スペースのみは空文字を返す', () => {
      expect(normalizeInput('   ')).toBe('')
    })

    it('99999 を超える値は 99999 に切り捨てる', () => {
      expect(normalizeInput('100000')).toBe(99999)
    })

    it('99999 はそのまま', () => {
      expect(normalizeInput('99999')).toBe(99999)
    })

    it('数値として解釈できない文字列は空文字を返す', () => {
      expect(normalizeInput('abc')).toBe('')
    })
  })

  describe('validateValue — 値のバリデーション', () => {
    it('正常な値はエラーなし', () => {
      expect(validateValue(100)).toBe('')
    })

    it('1 はエラーなし', () => {
      expect(validateValue(1)).toBe('')
    })

    it('99999 はエラーなし', () => {
      expect(validateValue(99999)).toBe('')
    })

    it('0 はエラー（数字を入力してください）', () => {
      expect(validateValue(0)).toBe(ERROR_MESSAGES.ZERO)
    })

    it('負の値はエラー（マイナスの値は計算できません）', () => {
      expect(validateValue(-1)).toBe(ERROR_MESSAGES.NEGATIVE)
    })

    it('-100 はエラー', () => {
      expect(validateValue(-100)).toBe(ERROR_MESSAGES.NEGATIVE)
    })

    it('空文字はエラーなし（未入力扱い）', () => {
      expect(validateValue('')).toBe('')
    })
  })

  describe('validateValue — 非数値型ガード（High: NaN 防止）', () => {
    it('文字列 "abc" はエラー（数字を入力してください）', () => {
      expect(validateValue('abc')).toBe(ERROR_MESSAGES.ZERO)
    })

    it('数字に見える文字列 "123" も型が string ならエラー', () => {
      expect(validateValue('123')).toBe(ERROR_MESSAGES.ZERO)
    })

    it('NaN はエラー', () => {
      expect(validateValue(NaN)).toBe(ERROR_MESSAGES.ZERO)
    })

    it('Infinity はエラー', () => {
      expect(validateValue(Infinity)).toBe(ERROR_MESSAGES.ZERO)
    })

    it('-Infinity はエラー', () => {
      expect(validateValue(-Infinity)).toBe(ERROR_MESSAGES.ZERO)
    })

    it('null はエラー', () => {
      expect(validateValue(null)).toBe(ERROR_MESSAGES.ZERO)
    })
  })
})
