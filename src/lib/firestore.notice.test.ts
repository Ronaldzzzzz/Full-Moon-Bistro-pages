import { describe, it, expect, vi, beforeEach } from 'vitest'

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
  limit: vi.fn(),
  increment: vi.fn((n) => n),
  writeBatch: vi.fn(() => ({
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  Timestamp: { now: vi.fn() },
}))

vi.mock('./firebase', () => ({ db: {} }))

import { getNotices, addNotice } from './firestore'

const makeDocs = (items: object[]) => ({
  docs: items.map((data, i) => ({
    id: `notice${i}`,
    data: () => data,
  })),
  empty: items.length === 0,
})

describe('Notices Firestore API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotices', () => {
    it('回傳含 id 的注意事項陣列', async () => {
      mocks.mockGetDocs.mockResolvedValue(
        makeDocs([{ content: '測試注意 1', isActive: true, emoji: '📢' }])
      )
      const notices = await getNotices()
      expect(notices).toHaveLength(1)
      expect(notices[0].id).toBe('notice0')
      expect(notices[0].content).toBe('測試注意 1')
    })
  })

  describe('addNotice', () => {
    it('呼叫 addDoc 並回傳新 id', async () => {
      mocks.mockAddDoc.mockResolvedValue({ id: 'newNotice123' })
      const id = await addNotice({
        content: '新注意事項',
        isActive: true,
        emoji: '🔥',
      })
      expect(mocks.mockAddDoc).toHaveBeenCalledOnce()
      expect(id).toBe('newNotice123')
    })
  })
})
