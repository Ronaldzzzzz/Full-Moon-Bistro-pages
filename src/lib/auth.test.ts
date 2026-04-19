import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, getAdminSession, clearAdminSession } from './auth'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn().mockResolvedValue({}),
  signOut: vi.fn().mockResolvedValue(undefined),
  setPersistence: vi.fn().mockResolvedValue(undefined),
  browserSessionPersistence: 'session',
  onAuthStateChanged: vi.fn(),
}))

vi.mock('./firebase', () => ({
  auth: {},
}))

describe('hashPassword', () => {
  it('對相同輸入產生相同雜湊值', async () => {
    const hash1 = await hashPassword('testpassword')
    const hash2 = await hashPassword('testpassword')
    expect(hash1).toBe(hash2)
  })

  it('對不同輸入產生不同雜湊值', async () => {
    const hash1 = await hashPassword('password1')
    const hash2 = await hashPassword('password2')
    expect(hash1).not.toBe(hash2)
  })

  it('回傳 64 字元十六進位字串（SHA-256）', async () => {
    const hash = await hashPassword('any')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('AdminSession', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('clearAdminSession 清除 sessionStorage', () => {
    sessionStorage.setItem('adminSession', JSON.stringify({ role: 'owner', label: '主廚' }))
    clearAdminSession()
    expect(sessionStorage.getItem('adminSession')).toBeNull()
  })

  it('getAdminSession 在無 session 時回傳 null', () => {
    expect(getAdminSession()).toBeNull()
  })

  it('getAdminSession 回傳已儲存的 session', () => {
    const session = { role: 'owner' as const, label: '主廚' }
    sessionStorage.setItem('adminSession', JSON.stringify(session))
    expect(getAdminSession()).toEqual(session)
  })
})
