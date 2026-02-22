import { MAX_ITEMS, MIN_ITEMS } from './constants.js'

/**
 * 空の商品を生成する
 * @returns {object} Item
 */
export function createItem() {
  return {
    qty: '',
    price: '',
    errors: { qty: '', price: '' },
  }
}

/**
 * アプリの初期状態を生成する
 * @returns {object} State
 */
export function createInitialState() {
  return {
    unit: 'g',
    items: [createItem(), createItem()],
    result: null,
  }
}

/**
 * 商品を1件追加する（最大4件制約あり）
 * @param {object} state
 * @returns {object} 新しい state
 */
export function addItem(state) {
  if (state.items.length >= MAX_ITEMS) return state
  return {
    ...state,
    items: [...state.items, createItem()],
  }
}

/**
 * 指定インデックスの商品を削除する（最低2件制約あり）
 * @param {object} state
 * @param {number} index
 * @returns {object} 新しい state
 */
export function removeItem(state, index) {
  if (state.items.length <= MIN_ITEMS) return state
  const items = state.items.filter((_, i) => i !== index)
  return { ...state, items }
}

/**
 * 商品のフィールドを更新する（イミュータブル）
 * @param {object} state
 * @param {number} index
 * @param {string} field  'qty' | 'price' | 'errors'
 * @param {*} value
 * @returns {object} 新しい state
 */
export function updateItemField(state, index, field, value) {
  const items = state.items.map((item, i) => {
    if (i !== index) return item
    return { ...item, [field]: value }
  })
  return { ...state, items }
}

/**
 * 単位を変更し、全商品の qty をクリアして result を null にする
 * @param {object} state
 * @param {string} unit
 * @returns {object} 新しい state
 */
export function setUnit(state, unit) {
  const items = state.items.map((item) => ({
    ...item,
    qty: '',
    errors: { ...item.errors, qty: '' },
  }))
  return { ...state, unit, items, result: null }
}
