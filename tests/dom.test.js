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
