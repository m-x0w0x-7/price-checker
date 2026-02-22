import { saveState, loadState, restoreState } from '../src/js/storage.js'
import { createInitialState, updateItemField, addItem } from '../src/js/state.js'
import { STORAGE_KEY } from '../src/js/constants.js'

describe('storage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('saveState', () => {
    it('unit と items の qty/price を sessionStorage に保存する', () => {
      const state = createInitialState()
      saveState(state)
      const raw = sessionStorage.getItem(STORAGE_KEY)
      expect(raw).not.toBeNull()

      const parsed = JSON.parse(raw)
      expect(parsed.unit).toBe('g')
      expect(parsed.items).toHaveLength(2)
      expect(parsed.items[0]).toEqual({ qty: '', price: '' })
    })

    it('unit が ml のとき ml で保存される', () => {
      let state = createInitialState()
      state = { ...state, unit: 'ml' }
      saveState(state)

      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
      expect(parsed.unit).toBe('ml')
    })

    it('入力済みの値が保存される', () => {
      let state = createInitialState()
      state = updateItemField(state, 0, 'qty', 200)
      state = updateItemField(state, 0, 'price', 300)
      saveState(state)

      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
      expect(parsed.items[0].qty).toBe(200)
      expect(parsed.items[0].price).toBe(300)
    })

    it('errors は保存されない', () => {
      const state = createInitialState()
      saveState(state)

      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
      expect(parsed.items[0].errors).toBeUndefined()
    })

    it('3件の商品が保存される', () => {
      let state = createInitialState()
      state = addItem(state)
      saveState(state)

      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
      expect(parsed.items).toHaveLength(3)
    })
  })

  describe('loadState', () => {
    it('保存されたデータを復元する', () => {
      const state = createInitialState()
      saveState(state)

      const loaded = loadState()
      expect(loaded).not.toBeNull()
      expect(loaded.unit).toBe('g')
      expect(loaded.items).toHaveLength(2)
    })

    it('sessionStorage が空のとき null を返す', () => {
      const loaded = loadState()
      expect(loaded).toBeNull()
    })

    it('不正な JSON のとき null を返す', () => {
      sessionStorage.setItem(STORAGE_KEY, 'invalid json')
      const loaded = loadState()
      expect(loaded).toBeNull()
    })

    it('入力値が復元される', () => {
      let state = createInitialState()
      state = updateItemField(state, 1, 'qty', 500)
      state = updateItemField(state, 1, 'price', 198)
      saveState(state)

      const loaded = loadState()
      expect(loaded.items[1].qty).toBe(500)
      expect(loaded.items[1].price).toBe(198)
    })
  })

  describe('restoreState', () => {
    it('保存データを完全な state 形式に変換する', () => {
      const saved = { unit: 'ml', items: [{ qty: 200, price: 300 }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('ml')
      expect(state.items[0].qty).toBe(200)
      expect(state.items[0].errors).toEqual({ qty: '', price: '' })
      expect(state.result).toBeNull()
    })

    it('unit が未定義のとき g にフォールバックする', () => {
      const saved = { items: [{ qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('g')
    })

    it('items が未定義のとき空配列にフォールバックする', () => {
      const saved = { unit: 'g' }
      const state = restoreState(saved)
      expect(state.items).toEqual([])
    })
  })
})
