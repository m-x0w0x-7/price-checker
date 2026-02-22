import { UNIT_BASE } from './constants.js'

/**
 * 単価を計算する
 * - g/ml: 円/100g or 円/100ml (base=100)
 * - piece/bag: 円/1個 or 円/1袋 (base=1)
 * - 表示は小数第1位四捨五入
 * @param {number} price
 * @param {number} qty
 * @param {string} unit
 * @returns {number}
 */
export function calcUnitPrice(price, qty, unit) {
  const base = UNIT_BASE[unit] ?? 1
  const raw = (price / qty) * base
  return Math.round(raw * 10) / 10
}

/**
 * 単価配列から最安判定を行う
 * @param {number[]} unitPrices
 * @returns {{ cheapestIndices: number[], labelType: 'cheapest' | 'tie' }}
 */
export function findCheapest(unitPrices) {
  const min = Math.min(...unitPrices)
  const cheapestIndices = unitPrices.reduce((acc, price, i) => {
    if (price === min) acc.push(i)
    return acc
  }, [])

  const labelType = cheapestIndices.length === 1 ? 'cheapest' : 'tie'
  return { cheapestIndices, labelType }
}

/**
 * 全商品の単価計算と最安判定を行う
 * - 未入力やエラーがある場合は null を返す
 * @param {object[]} items
 * @param {string} unit
 * @returns {object|null}
 */
export function calculate(items, unit) {
  const allValid = items.every(
    (item) =>
      item.qty !== '' &&
      item.price !== '' &&
      item.errors.qty === '' &&
      item.errors.price === ''
  )

  if (!allValid) return null

  const unitPrices = items.map((item) => calcUnitPrice(item.price, item.qty, unit))
  const { cheapestIndices, labelType } = findCheapest(unitPrices)

  return { unitPrices, cheapestIndices, labelType }
}
