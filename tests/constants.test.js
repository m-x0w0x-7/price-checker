import { UNITS, MAX_ITEMS, MIN_ITEMS, MAX_VALUE, UNIT_BASE } from '../src/js/constants.js'

describe('constants', () => {
  describe('UNITS', () => {
    it('4種類の単位が定義されている', () => {
      expect(UNITS).toEqual(['g', 'ml', 'piece', 'bag'])
    })
  })

  describe('MAX_ITEMS / MIN_ITEMS', () => {
    it('商品の最大数は4', () => {
      expect(MAX_ITEMS).toBe(4)
    })

    it('商品の最低数は2', () => {
      expect(MIN_ITEMS).toBe(2)
    })
  })

  describe('MAX_VALUE', () => {
    it('最大入力値は99999', () => {
      expect(MAX_VALUE).toBe(99999)
    })
  })

  describe('UNIT_BASE', () => {
    it('g の基準は100', () => {
      expect(UNIT_BASE.g).toBe(100)
    })

    it('ml の基準は100', () => {
      expect(UNIT_BASE.ml).toBe(100)
    })

    it('piece の基準は1', () => {
      expect(UNIT_BASE.piece).toBe(1)
    })

    it('bag の基準は1', () => {
      expect(UNIT_BASE.bag).toBe(1)
    })
  })
})
