import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrders, addOrder, deleteOrder, getGlobalSettings, updateGlobalSettings } from './firestore'

const mocks = vi.hoisted(() => ({
  mockGetDocs: vi.fn(),
  mockGetDoc: vi.fn(),
  mockAddDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockSetDoc: vi.fn(),
  mockServerTimestamp: vi.fn(() => ({ type: 'serverTimestamp' })),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_, path) => ({ path })),
  doc: vi.fn((_, path, id) => ({ path, id })),
  getDocs: mocks.mockGetDocs,
  getDoc: mocks.mockGetDoc,
  addDoc: mocks.mockAddDoc,
  deleteDoc: mocks.mockDeleteDoc,
  setDoc: mocks.mockSetDoc,
  serverTimestamp: mocks.mockServerTimestamp,
  query: vi.fn((...args) => args[0]),
  orderBy: vi.fn(),
  increment: vi.fn((n) => n),
  writeBatch: vi.fn(() => ({
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('./firebase', () => ({ db: {} }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Orders Firestore API', () => {
  it('getOrders 應回傳正確格式陣列', async () => {
    mocks.mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: 'order1',
          data: () => ({
            customerName: '旅人A',
            items: [{ menuItemId: 'item1', menuItemName: '奶茶', quantity: 2 }],
            timestamp: { seconds: 1700000000, nanoseconds: 0 },
          }),
        },
        {
          id: 'order2',
          data: () => ({
            customerName: '旅人B',
            items: [{ menuItemId: 'item2', menuItemName: '果汁', quantity: 1 }],
            timestamp: { seconds: 1700000100, nanoseconds: 0 },
            note: '不加糖',
          }),
        },
      ],
    })

    const result = await getOrders()

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 'order1', customerName: '旅人A' })
    expect(result[1]).toMatchObject({ id: 'order2', customerName: '旅人B', note: '不加糖' })
  })

  it('addOrder 應注入 serverTimestamp 並回傳 id', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'newOrder123' })

    const id = await addOrder({
      customerName: '旅人C',
      items: [{ menuItemId: 'item3', menuItemName: '拿鐵', quantity: 1 }],
    })

    expect(mocks.mockAddDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'orders' }),
      expect.objectContaining({
        customerName: '旅人C',
        timestamp: { type: 'serverTimestamp' },
      })
    )
    expect(id).toBe('newOrder123')
  })

  it('addOrder 傳入的資料不應包含 timestamp 欄位（由 serverTimestamp 覆蓋）', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'order456' })

    // 模擬呼叫者只傳 customerName + items，不含 timestamp
    await addOrder({
      customerName: '旅人D',
      items: [],
    })

    const callArgs = mocks.mockAddDoc.mock.calls[0][1]
    expect(callArgs.timestamp).toEqual({ type: 'serverTimestamp' })
  })

  it('deleteOrder 應呼叫 deleteDoc', async () => {
    mocks.mockDeleteDoc.mockResolvedValue(undefined)

    await deleteOrder('order789')

    expect(mocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'orders', id: 'order789' })
    )
  })
})

describe('GlobalSettings Firestore API', () => {
  it('getGlobalSettings 文件存在時應回傳正確資料', async () => {
    mocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        address: '艾歐澤亞第三區',
        orderCooldownMinutes: 15,
        photoUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      }),
    })

    const result = await getGlobalSettings()

    expect(result).toEqual({
      address: '艾歐澤亞第三區',
      orderCooldownMinutes: 15,
      photoUrls: [
        { url: 'https://example.com/photo1.jpg' },
        { url: 'https://example.com/photo2.jpg' },
      ],
    })
  })

  it('getGlobalSettings 文件存在但缺少 photoUrls 時應回傳空陣列', async () => {
    mocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        address: '烏爾達哈',
        orderCooldownMinutes: 30,
        // 故意省略 photoUrls 模擬舊文件
      }),
    })

    const result = await getGlobalSettings()

    expect(result.photoUrls).toEqual([])
    expect(result.address).toBe('烏爾達哈')
    expect(result.orderCooldownMinutes).toBe(30)
  })

  it('getGlobalSettings 文件不存在時應回傳預設值', async () => {
    mocks.mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
    })

    const result = await getGlobalSettings()

    expect(result).toEqual({
      address: '',
      orderCooldownMinutes: 30,
      photoUrls: [],
    })
  })

  it('updateGlobalSettings 應呼叫 setDoc 並帶 merge: true', async () => {
    mocks.mockSetDoc.mockResolvedValue(undefined)

    await updateGlobalSettings({ address: '格里達尼亞', orderCooldownMinutes: 45 })

    expect(mocks.mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'settings', id: 'global' }),
      { address: '格里達尼亞', orderCooldownMinutes: 45 },
      { merge: true }
    )
  })
})
