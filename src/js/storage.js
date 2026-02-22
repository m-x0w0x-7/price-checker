import { STORAGE_KEY } from './constants.js'

/**
 * 状態を sessionStorage に保存する
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
 * sessionStorage から状態を復元する
 * @returns {object|null}
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
