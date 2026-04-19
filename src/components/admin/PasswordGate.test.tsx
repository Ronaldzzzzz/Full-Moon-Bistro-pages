import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PasswordGate from './PasswordGate'

vi.mock('../../lib/auth', () => ({
  signInWithPassword: vi.fn(),
}))

import { signInWithPassword } from '../../lib/auth'

describe('PasswordGate', () => {
  it('顯示密碼輸入欄位與登入按鈕', () => {
    render(<PasswordGate onSuccess={vi.fn()} />)
    expect(screen.getByPlaceholderText('輸入管理密碼')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '進入後台' })).toBeInTheDocument()
  })

  it('密碼錯誤時顯示錯誤訊息', async () => {
    vi.mocked(signInWithPassword).mockRejectedValueOnce(new Error('密碼錯誤'))
    render(<PasswordGate onSuccess={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('輸入管理密碼'), {
      target: { value: 'wrongpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: '進入後台' }))
    await waitFor(() => {
      expect(screen.getByText('密碼錯誤')).toBeInTheDocument()
    })
  })

  it('密碼正確時呼叫 onSuccess', async () => {
    const session = { role: 'owner' as const, label: '主廚' }
    vi.mocked(signInWithPassword).mockResolvedValueOnce(session)
    const onSuccess = vi.fn()
    render(<PasswordGate onSuccess={onSuccess} />)
    fireEvent.change(screen.getByPlaceholderText('輸入管理密碼'), {
      target: { value: 'correctpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: '進入後台' }))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(session)
    })
  })
})
