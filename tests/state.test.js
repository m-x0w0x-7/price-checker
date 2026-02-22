import {
  createInitialState,
  createItem,
  addItem,
  removeItem,
  updateItemField,
  setUnit,
} from '../src/js/state.js'
import { MAX_ITEMS, MIN_ITEMS } from '../src/js/constants.js'

describe('state', () => {
  describe('createItem', () => {
    it('空の商品を作成する', () => {
      const item = createItem()
      expect(item).toEqual({
        qty: '',
        price: '',
        errors: { qty: '', price: '' },
      })
    })
  })

  describe('createInitialState', () => {
    it('初期状態は unit="g" で商品2件', () => {
      const state = createInitialState()
      expect(state.unit).toBe('g')
      expect(state.items.length).toBe(2)
    })

    it('各商品は空の初期値を持つ', () => {
      const state = createInitialState()
      state.items.forEach((item) => {
        expect(item.qty).toBe('')
        expect(item.price).toBe('')
        expect(item.errors.qty).toBe('')
        expect(item.errors.price).toBe('')
      })
    })

    it('result の初期値は null', () => {
      const state = createInitialState()
      expect(state.result).toBeNull()
    })
  })

  describe('addItem', () => {
    it('商品を1件追加する', () => {
      const state = createInitialState()
      const next = addItem(state)
      expect(next.items.length).toBe(3)
    })

    it(`最大${MAX_ITEMS}件を超えて追加しない`, () => {
      let state = createInitialState()
      for (let i = 0; i < 10; i++) {
        state = addItem(state)
      }
      expect(state.items.length).toBe(MAX_ITEMS)
    })

    it('既存の商品は変更されない', () => {
      const state = createInitialState()
      state.items[0].qty = 100
      const next = addItem(state)
      expect(next.items[0].qty).toBe(100)
    })

    it('新しく追加された商品は空の初期値を持つ', () => {
      const state = createInitialState()
      const next = addItem(state)
      const newItem = next.items[next.items.length - 1]
      expect(newItem.qty).toBe('')
      expect(newItem.price).toBe('')
    })
  })

  describe('removeItem', () => {
    it('指定インデックスの商品を削除する', () => {
      let state = createInitialState()
      state = addItem(state) // 3件に
      const next = removeItem(state, 1)
      expect(next.items.length).toBe(2)
    })

    it(`最低${MIN_ITEMS}件を下回って削除しない`, () => {
      const state = createInitialState() // 2件
      const next = removeItem(state, 0)
      expect(next.items.length).toBe(MIN_ITEMS)
    })

    it('先頭の商品を削除すると後続がずれる', () => {
      let state = createInitialState()
      state.items[0].qty = 100
      state.items[1].qty = 200
      state = addItem(state)
      state.items[2].qty = 300

      const next = removeItem(state, 0)
      expect(next.items[0].qty).toBe(200)
      expect(next.items[1].qty).toBe(300)
    })
  })

  describe('updateItemField', () => {
    it('qty フィールドを更新する', () => {
      const state = createInitialState()
      const next = updateItemField(state, 0, 'qty', 200)
      expect(next.items[0].qty).toBe(200)
    })

    it('price フィールドを更新する', () => {
      const state = createInitialState()
      const next = updateItemField(state, 1, 'price', 500)
      expect(next.items[1].price).toBe(500)
    })

    it('エラーフィールドを更新する', () => {
      const state = createInitialState()
      const next = updateItemField(state, 0, 'errors', { qty: 'エラー', price: '' })
      expect(next.items[0].errors.qty).toBe('エラー')
    })

    it('他のアイテムは変更されない', () => {
      const state = createInitialState()
      const next = updateItemField(state, 0, 'qty', 100)
      expect(next.items[1].qty).toBe('')
    })
  })

  describe('setUnit', () => {
    it('unit を変更する', () => {
      const state = createInitialState()
      const next = setUnit(state, 'ml')
      expect(next.unit).toBe('ml')
    })

    it('unit 変更時に全商品の qty をクリアする', () => {
      let state = createInitialState()
      state = updateItemField(state, 0, 'qty', 100)
      state = updateItemField(state, 1, 'qty', 200)

      const next = setUnit(state, 'ml')
      expect(next.items[0].qty).toBe('')
      expect(next.items[1].qty).toBe('')
    })

    it('unit 変更時に result を null にする', () => {
      let state = createInitialState()
      state.result = { unitPrices: [10, 20], cheapestIndices: [0], labelType: 'cheapest' }

      const next = setUnit(state, 'piece')
      expect(next.result).toBeNull()
    })

    it('unit 変更時に全商品の price もクリアする', () => {
      let state = createInitialState()
      state = updateItemField(state, 0, 'price', 500)
      state = updateItemField(state, 1, 'price', 300)

      const next = setUnit(state, 'bag')
      expect(next.items[0].price).toBe('')
      expect(next.items[1].price).toBe('')
    })

    it('unit 変更時に qty/price 両方の errors をクリアする', () => {
      let state = createInitialState()
      state = updateItemField(state, 0, 'errors', { qty: 'エラー', price: 'エラー' })

      const next = setUnit(state, 'ml')
      expect(next.items[0].errors.qty).toBe('')
      expect(next.items[0].errors.price).toBe('')
    })
  })
})
