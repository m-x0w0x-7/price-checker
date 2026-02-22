import { saveState, loadState, restoreState } from '../src/js/storage.js'
import { createInitialState, updateItemField, addItem } from '../src/js/state.js'
import { STORAGE_KEY, ERROR_MESSAGES, MIN_ITEMS, MAX_ITEMS } from '../src/js/constants.js'

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

    it('unit が不正値のとき g にフォールバックする', () => {
      const saved = { unit: 'evil', items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('g')
    })

    it('unit が空文字のとき g にフォールバックする', () => {
      const saved = { unit: '', items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('g')
    })

    it('unit が null のとき g にフォールバックする', () => {
      const saved = { unit: null, items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('g')
    })

    it('unit が g のとき g のまま', () => {
      const saved = { unit: 'g', items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('g')
    })

    it('unit が ml のとき ml のまま', () => {
      const saved = { unit: 'ml', items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('ml')
    })

    it('unit が piece のとき piece のまま', () => {
      const saved = { unit: 'piece', items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('piece')
    })

    it('unit が bag のとき bag のまま', () => {
      const saved = { unit: 'bag', items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.unit).toBe('bag')
    })

    it('items が未定義のとき MIN_ITEMS 件に補完される', () => {
      const saved = { unit: 'g' }
      const state = restoreState(saved)
      // 件数制約により空配列ではなく MIN_ITEMS 件になる
      expect(state.items.length).toBe(MIN_ITEMS)
    })
  })

  describe('restoreState — バリデーション（High: Infinity 防止）', () => {
    it('qty=0 は errors.qty に ZERO エラーが設定される', () => {
      const saved = { unit: 'g', items: [{ qty: 0, price: 100 }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      expect(state.items[0].errors.qty).toBe(ERROR_MESSAGES.ZERO)
    })

    it('price=0 は errors.price に ZERO エラーが設定される', () => {
      const saved = { unit: 'g', items: [{ qty: 100, price: 0 }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      expect(state.items[0].errors.price).toBe(ERROR_MESSAGES.ZERO)
    })

    it('qty=-1 は errors.qty に NEGATIVE エラーが設定される', () => {
      const saved = { unit: 'g', items: [{ qty: -1, price: 100 }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      expect(state.items[0].errors.qty).toBe(ERROR_MESSAGES.NEGATIVE)
    })

    it('price=-100 は errors.price に NEGATIVE エラーが設定される', () => {
      const saved = { unit: 'g', items: [{ qty: 100, price: -100 }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      expect(state.items[0].errors.price).toBe(ERROR_MESSAGES.NEGATIVE)
    })

    it('正常な値（qty=100, price=200）は errors が空', () => {
      const saved = { unit: 'g', items: [{ qty: 100, price: 200 }, { qty: 300, price: 400 }] }
      const state = restoreState(saved)
      expect(state.items[0].errors.qty).toBe('')
      expect(state.items[0].errors.price).toBe('')
    })

    it('空文字（未入力）は errors が空', () => {
      const saved = { unit: 'g', items: [{ qty: '', price: '' }, { qty: '', price: '' }] }
      const state = restoreState(saved)
      expect(state.items[0].errors.qty).toBe('')
      expect(state.items[0].errors.price).toBe('')
    })
  })

  describe('restoreState — 件数制約（Medium: 2〜4件）', () => {
    it(`0件のとき ${MIN_ITEMS} 件（最小）に補完される`, () => {
      const saved = { unit: 'g', items: [] }
      const state = restoreState(saved)
      expect(state.items.length).toBe(MIN_ITEMS)
    })

    it(`1件のとき ${MIN_ITEMS} 件（最小）に補完される`, () => {
      const saved = { unit: 'g', items: [{ qty: 100, price: 200 }] }
      const state = restoreState(saved)
      expect(state.items.length).toBe(MIN_ITEMS)
    })

    it(`5件のとき ${MAX_ITEMS} 件（最大）に切り捨てられる`, () => {
      const saved = { unit: 'g', items: Array(5).fill({ qty: 100, price: 200 }) }
      const state = restoreState(saved)
      expect(state.items.length).toBe(MAX_ITEMS)
    })

    it('補完された商品は空の初期値を持つ', () => {
      const saved = { unit: 'g', items: [{ qty: 100, price: 200 }] }
      const state = restoreState(saved)
      // 2件目は補完された空のアイテム
      expect(state.items[1].qty).toBe('')
      expect(state.items[1].price).toBe('')
      expect(state.items[1].errors).toEqual({ qty: '', price: '' })
    })

    it('2件のとき件数はそのまま', () => {
      const saved = { unit: 'g', items: [{ qty: 100, price: 200 }, { qty: 300, price: 400 }] }
      const state = restoreState(saved)
      expect(state.items.length).toBe(2)
    })
  })

  describe('restoreState — 非数値型正規化（High: NaN 防止）', () => {
    it('qty が文字列 "abc" のとき空文字に正規化され未入力扱いになる', () => {
      const saved = { unit: 'g', items: [{ qty: 'abc', price: 100 }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      // normalizeInput('abc') → '' → 未入力扱い（エラーなし）
      expect(state.items[0].qty).toBe('')
      expect(state.items[0].errors.qty).toBe('')
    })

    it('price が文字列 "xyz" のとき空文字に正規化される', () => {
      const saved = { unit: 'g', items: [{ qty: 100, price: 'xyz' }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      expect(state.items[0].price).toBe('')
      expect(state.items[0].errors.price).toBe('')
    })

    it('qty が null のとき空文字に正規化される', () => {
      const saved = { unit: 'g', items: [{ qty: null, price: 100 }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      expect(state.items[0].qty).toBe('')
    })

    it('正規化後に tryCalculate が NaN を計算しないこと（qty が空文字 = 計算スキップ）', () => {
      // qty='abc' → normalizeInput → '' → tryCalculate は qty !== '' を満たさず計算しない
      const saved = { unit: 'g', items: [{ qty: 'abc', price: 100 }, { qty: 100, price: 200 }] }
      const state = restoreState(saved)
      // qty が '' なので allValid=false → result=null（NaN にならない）
      expect(state.items[0].qty).toBe('')
      expect(state.result).toBeNull()
    })

    it('正常な数値文字列 "100" は 100（number）に正規化される', () => {
      // sessionStorage から復元した値が文字列 "100" の場合も正しく扱う
      const saved = { unit: 'g', items: [{ qty: '100', price: '200' }, { qty: 300, price: 400 }] }
      const state = restoreState(saved)
      expect(state.items[0].qty).toBe(100)
      expect(state.items[0].price).toBe(200)
      expect(state.items[0].errors.qty).toBe('')
      expect(state.items[0].errors.price).toBe('')
    })
  })
})
