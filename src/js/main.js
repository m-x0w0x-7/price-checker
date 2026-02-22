import { createInitialState, addItem, removeItem, setUnit, updateItemField } from './state.js'
import { renderItemList, updateAddButton, renderResult, renderError } from './dom.js'
import { loadState, saveState, restoreState } from './storage.js'
import { normalizeInput, validateValue } from './validation.js'
import { calculate } from './calculator.js'

const saved = loadState()
let state = saved ? restoreState(saved) : createInitialState()

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

/** 全商品の入力が有効かどうかを確認し、有効なら計算する */
function tryCalculate() {
  const allValid = state.items.every(
    (item) =>
      item.qty !== '' &&
      item.price !== '' &&
      item.errors.qty === '' &&
      item.errors.price === ''
  )

  if (allValid) {
    state = { ...state, result: calculate(state.items, state.unit) }
  } else {
    state = { ...state, result: null }
  }
}

/** 入力フィールドのフォーカスアウト処理 */
function handleBlur(input) {
  const index = Number(input.dataset.index)
  const field = input.dataset.field

  // 小数を切り捨て、MAX_VALUE を超える場合は丸める
  const normalized = normalizeInput(input.value)
  state = updateItemField(state, index, field, normalized)

  // バリデーション
  const error = validateValue(normalized)
  state = updateItemField(state, index, 'errors', {
    ...state.items[index].errors,
    [field]: error,
  })

  // 入力欄の表示値を更新（切り捨て後の値を反映）
  input.value = normalized === '' ? '' : String(normalized)

  // エラー表示を更新
  renderError(listEl, index, field, error)

  // 全商品有効なら計算
  tryCalculate()
  renderResult(listEl, state.result, state.unit)
  saveState(state)
}

/** Enter キーで次のフォーカス先に移動する */
function handleEnter(input) {
  const inputs = Array.from(listEl.querySelectorAll('.input-field__input'))
  const currentIndex = inputs.indexOf(input)
  const nextInput = inputs[currentIndex + 1]
  if (nextInput) {
    nextInput.focus()
  } else {
    input.blur()
  }
}

// ===========================
// 追加ボタン
// ===========================
addBtn.addEventListener('click', () => {
  state = addItem(state)
  render()
})

// ===========================
// 単位変更
// ===========================
unitSelect.addEventListener('change', (e) => {
  state = setUnit(state, e.target.value)
  unitSelect.value = state.unit
  render()
})

// ===========================
// 商品リスト内のイベント委譲
// ===========================
listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="remove"]')
  if (!btn) return
  const index = Number(btn.dataset.index)
  state = removeItem(state, index)
  state = { ...state, result: null }
  tryCalculate()
  render()
})

listEl.addEventListener('blur', (e) => {
  const input = e.target.closest('.input-field__input')
  if (!input) return
  handleBlur(input)
}, true)

listEl.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return
  const input = e.target.closest('.input-field__input')
  if (!input) return
  e.preventDefault()
  handleEnter(input)
})

// ===========================
// 外部タップでフォーカスを外す
// ===========================
// item-list 内の入力欄にフォーカスがある状態で外部をタップした場合のみ blur する。
// unit-select など item-list 外の要素は対象外にすることで誤 blur を防ぐ。
document.addEventListener('click', (e) => {
  const active = document.activeElement
  if (
    active instanceof HTMLElement &&
    listEl.contains(active) &&
    !e.target.closest('#item-list')
  ) {
    active.blur()
  }
})

// ===========================
// 初期描画
// ===========================
unitSelect.value = state.unit
render()
