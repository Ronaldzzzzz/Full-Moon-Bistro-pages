import { describe, it, expect } from 'vitest'
import { CATEGORY_LABELS, CATEGORY_ORDER } from './index'

describe('CATEGORY_LABELS', () => {
  it('包含全部五個分類的中文標籤', () => {
    expect(CATEGORY_LABELS.appetizer).toBe('開胃菜')
    expect(CATEGORY_LABELS.main).toBe('主食')
    expect(CATEGORY_LABELS.dessert).toBe('甜品')
    expect(CATEGORY_LABELS.drink).toBe('飲品')
    expect(CATEGORY_LABELS.set).toBe('套餐')
  })
})

describe('CATEGORY_ORDER', () => {
  it('包含全部五個分類且順序正確', () => {
    expect(CATEGORY_ORDER).toEqual(['appetizer', 'main', 'dessert', 'drink', 'set'])
  })
})
