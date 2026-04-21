import { describe, it, expect, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  mockGetDocs: vi.fn(),
  mockAddDoc: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockServerTimestamp: vi.fn(() => ({ type: 'serverTimestamp' })),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_, path) => ({ path })),
  doc: vi.fn((_, path, id) => ({ path, id })),
  getDocs: mocks.mockGetDocs,
  getDoc: mocks.mockGetDoc,
  addDoc: mocks.mockAddDoc,
  updateDoc: mocks.mockUpdateDoc,
  deleteDoc: mocks.mockDeleteDoc,
  serverTimestamp: mocks.mockServerTimestamp,
  query: vi.fn((...args) => args[0]),
  orderBy: vi.fn(),
  increment: vi.fn((n) => n),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  Timestamp: { now: vi.fn() },
}))

vi.mock('./firebase', () => ({ db: {} }))

// Mock global fetch for master data
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      "101": { n: "真實測試素材", i: "/icon/test.png" }
    })
  })
));

import {
  getMenuItems,
  addMenuItem,
  getInventoryItems,
} from './firestore'

const makeDocs = (items: object[]) => ({
  docs: items.map((data, i) => ({
    id: `id${i}`,
    data: () => data,
  })),
})

describe('getMenuItems', () => {
  it('回傳含 id 的菜品陣列', async () => {
    mocks.mockGetDocs.mockResolvedValue(
      makeDocs([{ name: '星芒沙拉', category: 'appetizer', price: 100, available: true, order: 0, description: '', imageUrl: '' }])
    )
    const items = await getMenuItems()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('id0')
    expect(items[0].name).toBe('星芒沙拉')
  })
})

describe('addMenuItem', () => {
  it('呼叫 addDoc 並回傳新 id', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'new123' })
    const id = await addMenuItem({
      category: 'appetizer',
      name: '測試品項',
      description: '',
      price: 100,
      imageUrl: '',
      available: true,
      order: 0,
    })
    expect(mocks.mockAddDoc).toHaveBeenCalledOnce()
    expect(id).toBe('new123')
  })

  it('傳入 ingredients 時，觸發 inventory 同步邏輯', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'new123' })
    mocks.mockGetDocs.mockResolvedValue(makeDocs([])) // 假設庫存為空

    await addMenuItem({
      category: 'drink',
      name: '特製咖啡',
      description: '',
      price: 200,
      imageUrl: '',
      available: true,
      order: 0,
      ingredients: [{ id: 101, amount: 2 }]
    })

    // 驗證是否呼叫 getDocs 獲取庫存
    expect(mocks.mockGetDocs).toHaveBeenCalled()
  })
})

describe('getInventoryItems', () => {
  it('回傳含 id 的庫存陣列', async () => {
    mocks.mockGetDocs.mockResolvedValue(
      makeDocs([{ name: '星芒草', stock: 10, unit: '份', note: '' }])
    )
    const items = await getInventoryItems()
    expect(items[0].name).toBe('星芒草')
  })
})
