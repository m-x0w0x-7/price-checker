import { createInitialState, addItem, removeItem, setUnit } from './state.js'
import { renderItemList, updateAddButton, renderResult } from './dom.js'
import { loadState, saveState } from './storage.js'

let state = loadState() ?? createInitialState()

const listEl = document.getElementById('item-list')
const addBtn = document.getElementById('add-btn')
const unitSelect = document.getElementById('unit-select')

/** 画面全体を再描画する */
function render() {
  renderItemList(listEl, state.items, state.unit)
  updateAddButton(addBtn, state.items.length)
  renderResult(listEl, state.result, state.unit)
  saveState(state)
}

/** 追加ボタン */
addBtn.addEventListener('click', () => {
  state = addItem(state)
  render()
})

/** 単位変更 */
unitSelect.addEventListener('change', (e) => {
  state = setUnit(state, e.target.value)
  unitSelect.value = state.unit
  render()
})

/** 商品リスト内のイベント委譲 */
listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="remove"]')
  if (!btn) return
  const index = Number(btn.dataset.index)
  state = removeItem(state, index)
  render()
})

/** 入力欄のイベントは Phase 3 で追加 */

// 外部タップでフォーカスを外す
document.addEventListener('click', (e) => {
  if (!e.target.closest('.item-card')) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }
})

// 初期描画
unitSelect.value = state.unit
render()
