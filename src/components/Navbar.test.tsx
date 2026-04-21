import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

const mocks = vi.hoisted(() => ({
  getGlobalSettings: vi.fn(),
}))

vi.mock('../lib/firestore', () => ({
  getGlobalSettings: mocks.getGlobalSettings,
}))

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Navbar', () => {
  it('getGlobalSettings 成功時應顯示地址', async () => {
    mocks.getGlobalSettings.mockResolvedValueOnce({
      address: '艾歐澤亞·烏爾達哈',
      orderCooldownMinutes: 30,
      photoUrls: [],
    })

    renderNavbar()

    await waitFor(() => {
      expect(screen.getByText(/艾歐澤亞·烏爾達哈/)).toBeInTheDocument()
    })
  })

  it('address 為空字串時不顯示地址列', async () => {
    mocks.getGlobalSettings.mockResolvedValueOnce({
      address: '',
      orderCooldownMinutes: 30,
      photoUrls: [],
    })

    renderNavbar()

    await waitFor(() => {
      // 等待 Promise resolve
      expect(mocks.getGlobalSettings).toHaveBeenCalled()
    })

    expect(screen.queryByText(/📍/)).not.toBeInTheDocument()
  })

  it('getGlobalSettings 失敗時不顯示地址（靜默失敗）', async () => {
    mocks.getGlobalSettings.mockRejectedValueOnce(new Error('網路錯誤'))

    renderNavbar()

    // 給 Promise 一點時間
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(screen.queryByText(/📍/)).not.toBeInTheDocument()
  })

  it('FULL-MOON-BISTRO 品牌名稱應始終顯示', async () => {
    mocks.getGlobalSettings.mockResolvedValueOnce({
      address: '',
      orderCooldownMinutes: 5,
      photoUrls: [],
    })

    renderNavbar()

    expect(screen.getByText('FULL-MOON-BISTRO')).toBeInTheDocument()
  })
})
