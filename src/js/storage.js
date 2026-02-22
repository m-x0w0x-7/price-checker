import { STORAGE_KEY, MIN_ITEMS, MAX_ITEMS } from './constants.js'
import { normalizeInput, validateValue } from './validation.js'
import { createItem } from './state.js'

/**
 * 状態を sessionStorage に保存する
 * - errors と result は保存しない（再計算するため）
 * @param {object} state
 */
export function saveState(state) {
  try {
    const data = {
      unit: state.unit,
      items: state.items.map(({ qty, price }) => ({ qty, price })),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage 未対応環境では無視
  }
}

/**
 * sessionStorage から保存データを読み込む
 * @returns {{ unit: string, items: Array<{qty: number|'', price: number|''}> }|null}
 */
export function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * 保存データをアプリ状態に変換する
 * - 各値を再バリデーションし errors を設定する（Infinity 防止）
 * - 件数を MIN_ITEMS〜MAX_ITEMS に正規化する（仕様違反防止）
 * @param {{ unit: string, items: Array<{qty: number|'', price: number|''}> }} saved
 * @returns {object} state
 */
export function restoreState(saved) {
  // 最大件数に切り捨て → 値を正規化してバリデーション
  const rawItems = (saved.items ?? []).slice(0, MAX_ITEMS)
  let items = rawItems.map((item) => {
    // normalizeInput で型正規化（非数値文字列 → ''、数値は number 型に統一）
    const qty = normalizeInput(item.qty ?? '')
    const price = normalizeInput(item.price ?? '')
    return {
      qty,
      price,
      errors: {
        qty: validateValue(qty),
        price: validateValue(price),
      },
    }
  })

  // 最小件数に満たない場合は空のアイテムで補完
  while (items.length < MIN_ITEMS) {
    items.push(createItem())
  }

  return {
    unit: saved.unit ?? 'g',
    items,
    result: null,
  }
}
