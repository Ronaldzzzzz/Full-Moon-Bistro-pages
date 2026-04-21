import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Firebase 必須在 import AdminPage 前 mock，否則 firebase.ts 真的初始化
vi.mock('../lib/firebase', () => ({ db: {}, auth: {}, storage: {} }))

import AdminPage from './AdminPage'

// Mock 所有後台元件，避免依賴 Firebase
vi.mock('../components/admin/PasswordGate', () => ({
  default: ({ onSuccess }: { onSuccess: (s: { role: 'owner' | 'staff'; label: string }) => void }) => (
    <button onClick={() => onSuccess({ role: 'owner', label: '測試管理員' })}>
      模擬登入
    </button>
  ),
}))
vi.mock('../components/admin/MenuManager', () => ({ default: () => <div>MenuManager</div> }))
vi.mock('../components/admin/InventoryManager', () => ({ default: () => <div>InventoryManager</div> }))
vi.mock('../components/admin/MessageManager', () => ({ default: () => <div>MessageManager</div> }))
vi.mock('../components/admin/NoticeManager', () => ({ default: () => <div>NoticeManager</div> }))
vi.mock('../components/admin/OrderManager', () => ({ default: () => <div>OrderManager</div> }))
vi.mock('../components/admin/AdminManager', () => ({ default: () => <div>AdminManager</div> }))
vi.mock('../components/admin/GlobalSettingsManager', () => ({
  default: () => <div data-testid="global-settings-manager">GlobalSettingsManager</div>,
}))

const mocks = vi.hoisted(() => ({
  onAuthChange: vi.fn(() => () => {}),
  getAdminSession: vi.fn(() => null),
  signOutAdmin: vi.fn(),
}))

vi.mock('../lib/auth', () => ({
  onAuthChange: mocks.onAuthChange,
  getAdminSession: mocks.getAdminSession,
  signOutAdmin: mocks.signOutAdmin,
}))

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getAdminSession.mockReturnValue(null)
  mocks.onAuthChange.mockReturnValue(() => {})
})

describe('AdminPage Task 4 整合', () => {
  it('登入後應顯示「系統設定」分頁', async () => {
    const user = userEvent.setup()
    renderAdmin()

    await user.click(screen.getByText('模擬登入'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '系統設定' })).toBeInTheDocument()
    })
  })

  it('不應有獨立的「宣傳照管理」分頁', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await user.click(screen.getByText('模擬登入'))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '宣傳照管理' })).not.toBeInTheDocument()
    })
  })

  it('點擊「系統設定」分頁應渲染 GlobalSettingsManager', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await user.click(screen.getByText('模擬登入'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '系統設定' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '系統設定' }))

    await waitFor(() => {
      expect(screen.getByTestId('global-settings-manager')).toBeInTheDocument()
    })
  })

  it('應保留「點餐管理」分頁', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await user.click(screen.getByText('模擬登入'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '點餐管理' })).toBeInTheDocument()
    })
  })
})
