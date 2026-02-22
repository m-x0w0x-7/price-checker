import { STORAGE_KEY } from './constants.js'

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
 * 保存データをアプリ状態に変換する（errors と result を付与）
 * @param {{ unit: string, items: Array<{qty: number|'', price: number|''}> }} saved
 * @returns {object} state
 */
export function restoreState(saved) {
  return {
    unit: saved.unit ?? 'g',
    items: (saved.items ?? []).map((item) => ({
      qty: item.qty ?? '',
      price: item.price ?? '',
      errors: { qty: '', price: '' },
    })),
    result: null,
  }
}
