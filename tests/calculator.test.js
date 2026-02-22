import { calcUnitPrice, findCheapest, calculate } from '../src/js/calculator.js'

describe('calculator', () => {
  describe('calcUnitPrice — 単価計算', () => {
    it('g: 200g で 300 円 → 150.0 円/100g', () => {
      expect(calcUnitPrice(300, 200, 'g')).toBe(150.0)
    })

    it('g: 300g で 450 円 → 150.0 円/100g', () => {
      expect(calcUnitPrice(450, 300, 'g')).toBe(150.0)
    })

    it('ml: 500ml で 198 円 → 39.6 円/100ml', () => {
      expect(calcUnitPrice(198, 500, 'ml')).toBe(39.6)
    })

    it('piece: 5個 で 100 円 → 20.0 円/1個', () => {
      expect(calcUnitPrice(100, 5, 'piece')).toBe(20.0)
    })

    it('bag: 3袋 で 297 円 → 99.0 円/1袋', () => {
      expect(calcUnitPrice(297, 3, 'bag')).toBe(99.0)
    })

    it('小数第1位で四捨五入（切り上げ）', () => {
      // 100 / 300 * 100 = 33.333... → 33.3
      expect(calcUnitPrice(100, 300, 'g')).toBe(33.3)
    })

    it('小数第1位で四捨五入（切り捨て）', () => {
      // 100 / 301 * 100 = 33.222... → 33.2
      expect(calcUnitPrice(100, 301, 'g')).toBe(33.2)
    })

    it('ちょうど割り切れる場合（1桁になる）', () => {
      // 100 / 1000 * 100 = 10.0
      expect(calcUnitPrice(100, 1000, 'g')).toBe(10.0)
    })
  })

  describe('findCheapest — 最安判定', () => {
    it('単独最安を返す', () => {
      const result = findCheapest([150.0, 200.0, 180.0])
      expect(result.cheapestIndices).toEqual([0])
      expect(result.labelType).toBe('cheapest')
    })

    it('同率最安（2件）を返す', () => {
      const result = findCheapest([150.0, 150.0])
      expect(result.cheapestIndices).toEqual([0, 1])
      expect(result.labelType).toBe('tie')
    })

    it('同率最安（3件）を返す', () => {
      const result = findCheapest([100.0, 100.0, 100.0])
      expect(result.cheapestIndices).toEqual([0, 1, 2])
      expect(result.labelType).toBe('tie')
    })

    it('最後尾が最安', () => {
      const result = findCheapest([200.0, 150.0, 180.0, 100.0])
      expect(result.cheapestIndices).toEqual([3])
      expect(result.labelType).toBe('cheapest')
    })

    it('全て同率最安', () => {
      const result = findCheapest([50.0, 50.0, 50.0, 50.0])
      expect(result.cheapestIndices).toEqual([0, 1, 2, 3])
      expect(result.labelType).toBe('tie')
    })
  })

  describe('calculate — 全体計算', () => {
    it('2件の商品を計算して結果を返す（g）', () => {
      const items = [
        { qty: 200, price: 300, errors: { qty: '', price: '' } },
        { qty: 300, price: 450, errors: { qty: '', price: '' } },
      ]
      // 300/200*100=150, 450/300*100=150 → 同率
      const result = calculate(items, 'g')
      expect(result.unitPrices).toEqual([150.0, 150.0])
      expect(result.cheapestIndices).toEqual([0, 1])
      expect(result.labelType).toBe('tie')
    })

    it('2件の商品を計算して単独最安を返す（ml）', () => {
      const items = [
        { qty: 500, price: 198, errors: { qty: '', price: '' } },
        { qty: 500, price: 220, errors: { qty: '', price: '' } },
      ]
      const result = calculate(items, 'ml')
      expect(result.unitPrices[0]).toBe(39.6)
      expect(result.unitPrices[1]).toBe(44.0)
      expect(result.cheapestIndices).toEqual([0])
      expect(result.labelType).toBe('cheapest')
    })

    it('piece の計算（base=1）', () => {
      const items = [
        { qty: 6, price: 300, errors: { qty: '', price: '' } },
        { qty: 4, price: 200, errors: { qty: '', price: '' } },
      ]
      // 300/6*1=50, 200/4*1=50 → 同率
      const result = calculate(items, 'piece')
      expect(result.unitPrices).toEqual([50.0, 50.0])
      expect(result.labelType).toBe('tie')
    })

    it('未入力がある場合は null を返す', () => {
      const items = [
        { qty: '', price: 300, errors: { qty: '', price: '' } },
        { qty: 300, price: 450, errors: { qty: '', price: '' } },
      ]
      const result = calculate(items, 'g')
      expect(result).toBeNull()
    })

    it('エラーがある場合は null を返す', () => {
      const items = [
        { qty: 0, price: 300, errors: { qty: '数字を入力してください', price: '' } },
        { qty: 300, price: 450, errors: { qty: '', price: '' } },
      ]
      const result = calculate(items, 'g')
      expect(result).toBeNull()
    })
  })
})
