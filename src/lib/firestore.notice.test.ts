import { describe, it, expect, vi } from 'vitest'
import { addNotice } from './firestore'

const mocks = vi.hoisted(() => ({
  mockGetDocs: vi.fn(),
  mockAddDoc: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockServerTimestamp: vi.fn(() => ({ type: 'serverTimestamp' })),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_, path) => ({ path })),
  doc: vi.fn((_, path, id) => ({ path, id })),
  getDocs: mocks.mockGetDocs,
  addDoc: mocks.mockAddDoc,
  updateDoc: mocks.mockUpdateDoc,
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

describe('Notices Firestore API', () => {
  it('addNotice should call addDoc with correct data', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'notice123' })
    const id = await addNotice({
      emoji: '📢',
      lines: ['Line 1', 'Line 2'],
    })
    expect(mocks.mockAddDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'notices' }),
      expect.objectContaining({
        emoji: '📢',
        lines: ['Line 1', 'Line 2'],
        updatedAt: { type: 'serverTimestamp' }
      })
    )
    expect(id).toBe('notice123')
  })
})
