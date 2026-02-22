import { createItemCard, renderItemList, updateAddButton, renderResult, renderError } from '../src/js/dom.js'
import { createItem, createInitialState } from '../src/js/state.js'

describe('dom', () => {
  describe('createItemCard', () => {
    it('li 要素を返す', () => {
      const item = createItem()
      const card = createItemCard(item, 0, 'g')
      expect(card.tagName).toBe('LI')
    })

    it('data-index が設定されている', () => {
      const item = createItem()
      const card = createItemCard(item, 2, 'g')
      expect(card.dataset.index).toBe('2')
    })

    it('qty と price の input が存在する', () => {
      const item = createItem()
      const card = createItemCard(item, 0, 'g')
      expect(card.querySelector('[data-field="qty"]')).not.toBeNull()
      expect(card.querySelector('[data-field="price"]')).not.toBeNull()
    })

    it('単位ラベルが表示される（g）', () => {
      const item = createItem()
      const card = createItemCard(item, 0, 'g')
      const unitEl = card.querySelector('.input-field__unit')
      expect(unitEl.textContent).toBe('g')
    })

    it('単位ラベルが表示される（ml）', () => {
      const item = createItem()
      const card = createItemCard(item, 0, 'ml')
      const unitEl = card.querySelector('.input-field__unit')
      expect(unitEl.textContent).toBe('ml')
    })

    it('エラー領域が存在する', () => {
      const item = createItem()
      const card = createItemCard(item, 0, 'g')
      expect(card.querySelector('[data-error="qty"]')).not.toBeNull()
      expect(card.querySelector('[data-error="price"]')).not.toBeNull()
    })

    it('単価表示エリアが -- を含む', () => {
      const item = createItem()
      const card = createItemCard(item, 0, 'g')
      const priceEl = card.querySelector('.item-card__unit-price')
      expect(priceEl.textContent).toContain('--')
    })

    it('削除ボタンが存在する', () => {
      const item = createItem()
      const card = createItemCard(item, 0, 'g')
      expect(card.querySelector('[data-action="remove"]')).not.toBeNull()
    })
  })

  describe('createItemCard — XSS 対策（Medium: innerHTML 未エスケープ防止）', () => {
    it('item.qty の値が HTML として解釈されない（input.value で設定）', () => {
      const item = { qty: 100, price: 200, errors: { qty: '', price: '' } }
      const card = createItemCard(item, 0, 'g')
      const input = card.querySelector('[data-field="qty"]')
      // .value プロパティで設定されていること
      expect(input.value).toBe('100')
    })

    it('item.price の値が HTML として解釈されない（input.value で設定）', () => {
      const item = { qty: 100, price: 200, errors: { qty: '', price: '' } }
      const card = createItemCard(item, 0, 'g')
      const input = card.querySelector('[data-field="price"]')
      expect(input.value).toBe('200')
    })

    it('errors.qty がテキストとして設定され HTML タグを解釈しない', () => {
      const item = { qty: 0, price: 200, errors: { qty: '<b>注入</b>', price: '' } }
      const card = createItemCard(item, 0, 'g')
      const errorEl = card.querySelector('[data-error="qty"]')
      // <b> タグが DOM 要素として解釈されていないこと
      expect(errorEl.querySelector('b')).toBeNull()
      // テキストとしてそのまま表示されること
      expect(errorEl.textContent).toBe('<b>注入</b>')
    })

    it('errors.price がテキストとして設定され HTML タグを解釈しない', () => {
      const item = { qty: 100, price: 0, errors: { qty: '', price: '<script>evil()</script>' } }
      const card = createItemCard(item, 0, 'g')
      const errorEl = card.querySelector('[data-error="price"]')
      expect(errorEl.querySelector('script')).toBeNull()
      expect(errorEl.textContent).toBe('<script>evil()</script>')
    })

    it('item.qty の改ざん値が innerHTML に属性として注入されない', () => {
      // sessionStorage 改ざんを想定: " data-evil="injected
      const item = { qty: '" data-evil="injected', price: '', errors: { qty: '', price: '' } }
      const card = createItemCard(item, 0, 'g')
      // data-evil 属性が生成されていないこと
      const qtyInput = card.querySelector('[data-field="qty"]')
      expect(qtyInput.dataset.evil).toBeUndefined()
    })
  })

  describe('renderItemList', () => {
    let listEl

    beforeEach(() => {
      listEl = document.createElement('ul')
    })

    it('2件のカードが描画される', () => {
      const state = createInitialState()
      renderItemList(listEl, state.items, state.unit)
      expect(listEl.querySelectorAll('.item-card').length).toBe(2)
    })

    it('2件のとき item-list--multi クラスが付かない', () => {
      const state = createInitialState()
      renderItemList(listEl, state.items, state.unit)
      expect(listEl.classList.contains('item-list--multi')).toBe(false)
    })

    it('3件のとき item-list--multi クラスが付く', () => {
      const state = createInitialState()
      const items = [...state.items, createItem()]
      renderItemList(listEl, items, state.unit)
      expect(listEl.classList.contains('item-list--multi')).toBe(true)
    })
  })

  describe('updateAddButton', () => {
    let btn

    beforeEach(() => {
      btn = document.createElement('button')
    })

    it('4件のとき disabled になる', () => {
      updateAddButton(btn, 4)
      expect(btn.disabled).toBe(true)
    })

    it('3件のとき disabled でない', () => {
      updateAddButton(btn, 3)
      expect(btn.disabled).toBe(false)
    })

    it('2件のとき disabled でない', () => {
      updateAddButton(btn, 2)
      expect(btn.disabled).toBe(false)
    })
  })

  describe('renderError', () => {
    let listEl

    beforeEach(() => {
      const state = createInitialState()
      listEl = document.createElement('ul')
      renderItemList(listEl, state.items, state.unit)
    })

    it('エラーメッセージを表示する', () => {
      renderError(listEl, 0, 'qty', 'エラーです')
      const errorEl = listEl.querySelector('[data-error="qty"][data-index="0"]')
      expect(errorEl.textContent).toBe('エラーです')
    })

    it('エラーメッセージをクリアする', () => {
      renderError(listEl, 0, 'qty', 'エラーです')
      renderError(listEl, 0, 'qty', '')
      const errorEl = listEl.querySelector('[data-error="qty"][data-index="0"]')
      expect(errorEl.textContent).toBe('')
    })

    it('エラーがある場合 input-field__wrapper--error クラスが付く', () => {
      renderError(listEl, 0, 'qty', 'エラー')
      const input = listEl.querySelector('[data-field="qty"][data-index="0"]')
      const wrapper = input.closest('.input-field__wrapper')
      expect(wrapper.classList.contains('input-field__wrapper--error')).toBe(true)
    })

    it('エラーがない場合 input-field__wrapper--error クラスが外れる', () => {
      renderError(listEl, 0, 'qty', 'エラー')
      renderError(listEl, 0, 'qty', '')
      const input = listEl.querySelector('[data-field="qty"][data-index="0"]')
      const wrapper = input.closest('.input-field__wrapper')
      expect(wrapper.classList.contains('input-field__wrapper--error')).toBe(false)
    })
  })

  describe('renderResult', () => {
    let listEl

    beforeEach(() => {
      const state = createInitialState()
      listEl = document.createElement('ul')
      renderItemList(listEl, state.items, state.unit)
    })

    it('result が null のとき -- 表示', () => {
      renderResult(listEl, null, 'g')
      const priceEls = listEl.querySelectorAll('.item-card__unit-price')
      priceEls.forEach((el) => expect(el.textContent).toContain('--'))
    })

    it('単独最安のとき cheapest クラスが付く', () => {
      const result = {
        unitPrices: [10, 20],
        cheapestIndices: [0],
        labelType: 'cheapest',
      }
      renderResult(listEl, result, 'g')
      const cards = listEl.querySelectorAll('.item-card')
      expect(cards[0].classList.contains('item-card--cheapest')).toBe(true)
      expect(cards[1].classList.contains('item-card--cheapest')).toBe(false)
    })

    it('同率最安のとき tie クラスが両方に付く', () => {
      const result = {
        unitPrices: [10, 10],
        cheapestIndices: [0, 1],
        labelType: 'tie',
      }
      renderResult(listEl, result, 'g')
      const cards = listEl.querySelectorAll('.item-card')
      expect(cards[0].classList.contains('item-card--tie')).toBe(true)
      expect(cards[1].classList.contains('item-card--tie')).toBe(true)
    })

    it('単価を表示する', () => {
      const result = {
        unitPrices: [125.5, 98.3],
        cheapestIndices: [1],
        labelType: 'cheapest',
      }
      renderResult(listEl, result, 'g')
      const priceEls = listEl.querySelectorAll('.item-card__unit-price')
      expect(priceEls[0].textContent).toContain('125.5')
      expect(priceEls[1].textContent).toContain('98.3')
    })
  })
})
