import { UNIT_LABEL, UNIT_DISPLAY, MIN_ITEMS, MAX_ITEMS } from './constants.js'

/**
 * 商品カードの HTML 要素を生成する
 * @param {object} item
 * @param {number} index
 * @param {string} unit
 * @returns {HTMLElement}
 */
export function createItemCard(item, index, unit) {
  const li = document.createElement('li')
  li.className = 'item-card'
  li.dataset.index = String(index)

  const unitDisplay = UNIT_DISPLAY[unit] ?? ''

  // ユーザー由来の値（item.qty, item.price, item.errors.*）は innerHTML に含めない。
  // index はアプリ内部の数値のみなので埋め込みは安全。
  li.innerHTML = `
    <div class="item-card__header">
      <span class="item-card__number">商品 ${index + 1}</span>
      <button class="item-card__delete-btn" type="button" data-action="remove" data-index="${index}">削除</button>
    </div>
    <div class="item-card__inputs">
      <div class="input-field">
        <label class="input-field__label" for="qty-${index}">容量</label>
        <div class="input-field__wrapper">
          <input
            class="input-field__input"
            type="number"
            id="qty-${index}"
            inputmode="numeric"
            pattern="[0-9]*"
            min="1"
            max="99999"
            step="1"
            placeholder="0"
            data-field="qty"
            data-index="${index}"
          />
          <span class="input-field__unit"></span>
        </div>
        <span class="input-field__error" data-error="qty" data-index="${index}"></span>
      </div>
      <div class="input-field">
        <label class="input-field__label" for="price-${index}">価格</label>
        <div class="input-field__wrapper">
          <input
            class="input-field__input"
            type="number"
            id="price-${index}"
            inputmode="numeric"
            pattern="[0-9]*"
            min="1"
            max="99999"
            step="1"
            placeholder="0"
            data-field="price"
            data-index="${index}"
          />
          <span class="input-field__unit">円</span>
        </div>
        <span class="input-field__error" data-error="price" data-index="${index}"></span>
      </div>
    </div>
    <div class="item-card__result">
      <span class="item-card__unit-price item-card__unit-price--placeholder"></span>
      <span class="item-card__badge item-card__badge--cheapest">こっちがお得！</span>
      <span class="item-card__badge item-card__badge--tie">同じ</span>
    </div>
  `

  // ユーザー由来の値は安全な DOM API で設定する
  const qtyInput = li.querySelector('[data-field="qty"]')
  const priceInput = li.querySelector('[data-field="price"]')
  const qtyUnitEl = li.querySelector('.input-field__unit')
  const qtyErrorEl = li.querySelector('[data-error="qty"]')
  const priceErrorEl = li.querySelector('[data-error="price"]')
  const unitPriceEl = li.querySelector('.item-card__unit-price')

  qtyInput.value = item.qty === '' ? '' : String(item.qty)
  priceInput.value = item.price === '' ? '' : String(item.price)
  qtyUnitEl.textContent = UNIT_LABEL[unit] ?? unit
  qtyErrorEl.textContent = item.errors.qty
  priceErrorEl.textContent = item.errors.price
  unitPriceEl.textContent = `-- ${unitDisplay}`

  // エラーがある場合は input-field__wrapper--error クラスを付与
  if (item.errors.qty) {
    qtyInput.closest('.input-field__wrapper').classList.add('input-field__wrapper--error')
  }
  if (item.errors.price) {
    priceInput.closest('.input-field__wrapper').classList.add('input-field__wrapper--error')
  }

  return li
}

/**
 * 商品リスト全体を再描画する
 * @param {HTMLElement} listEl
 * @param {object[]} items
 * @param {string} unit
 */
export function renderItemList(listEl, items, unit) {
  listEl.innerHTML = ''

  items.forEach((item, index) => {
    const card = createItemCard(item, index, unit)
    listEl.appendChild(card)
  })

  // 3件以上のとき削除ボタンを表示するクラスを付与
  if (items.length > MIN_ITEMS) {
    listEl.classList.add('item-list--multi')
  } else {
    listEl.classList.remove('item-list--multi')
  }
}

/**
 * 追加ボタンの有効/無効を切り替える
 * @param {HTMLElement} addBtn
 * @param {number} itemCount
 */
export function updateAddButton(addBtn, itemCount) {
  addBtn.disabled = itemCount >= MAX_ITEMS
}

/**
 * 結果表示を更新する
 * @param {HTMLElement} listEl
 * @param {object|null} result
 * @param {string} unit
 */
export function renderResult(listEl, result, unit) {
  const unitDisplay = UNIT_DISPLAY[unit] ?? ''
  const cards = listEl.querySelectorAll('.item-card')

  cards.forEach((card, index) => {
    const unitPriceEl = card.querySelector('.item-card__unit-price')

    // クラスリセット
    card.classList.remove('item-card--cheapest', 'item-card--tie')

    if (!result || !result.unitPrices || result.unitPrices[index] == null) {
      unitPriceEl.textContent = `-- ${unitDisplay}`
      unitPriceEl.classList.add('item-card__unit-price--placeholder')
      return
    }

    const price = result.unitPrices[index]
    unitPriceEl.textContent = `${price} ${unitDisplay}`
    unitPriceEl.classList.remove('item-card__unit-price--placeholder')

    if (result.cheapestIndices.includes(index)) {
      if (result.labelType === 'cheapest') {
        card.classList.add('item-card--cheapest')
      } else if (result.labelType === 'tie') {
        card.classList.add('item-card--tie')
      }
    }
  })
}

/**
 * エラー表示と入力欄のスタイルを更新する
 * @param {HTMLElement} listEl
 * @param {number} index
 * @param {string} field 'qty' | 'price'
 * @param {string} errorMessage
 */
export function renderError(listEl, index, field, errorMessage) {
  const errorEl = listEl.querySelector(
    `[data-error="${field}"][data-index="${index}"]`
  )
  const inputWrapper = listEl.querySelector(
    `[data-field="${field}"][data-index="${index}"]`
  )?.closest('.input-field__wrapper')

  if (errorEl) errorEl.textContent = errorMessage
  if (inputWrapper) {
    if (errorMessage) {
      inputWrapper.classList.add('input-field__wrapper--error')
    } else {
      inputWrapper.classList.remove('input-field__wrapper--error')
    }
  }
}

/**
 * 単位ラベルを全カードで更新する
 * @param {HTMLElement} listEl
 * @param {string} unit
 */
export function updateUnitLabels(listEl, unit) {
  const unitLabel = UNIT_LABEL[unit] ?? unit
  listEl.querySelectorAll('.input-field__unit').forEach((el, i) => {
    // 偶数インデックスが qty の単位、奇数が価格（円）
    if (i % 2 === 0) el.textContent = unitLabel
  })
}
