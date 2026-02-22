export const UNITS = ['g', 'ml', 'piece', 'bag']

export const MAX_ITEMS = 4
export const MIN_ITEMS = 2
export const MAX_VALUE = 99999

export const UNIT_BASE = {
  g: 100,
  ml: 100,
  piece: 1,
  bag: 1,
}

export const UNIT_LABEL = {
  g: 'g',
  ml: 'ml',
  piece: '個',
  bag: '袋',
}

export const UNIT_DISPLAY = {
  g: '円/100g',
  ml: '円/100ml',
  piece: '円/1個',
  bag: '円/1袋',
}

export const ERROR_MESSAGES = {
  ZERO: '数字を入力してください',
  NEGATIVE: 'マイナスの値は計算できません',
}

export const STORAGE_KEY = 'price-checker-state'
