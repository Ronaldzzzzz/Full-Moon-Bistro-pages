import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GlobalSettingsManager from './GlobalSettingsManager'

const mocks = vi.hoisted(() => ({
  getGlobalSettings: vi.fn(),
  updateGlobalSettings: vi.fn(),
}))

vi.mock('../../lib/firestore', () => ({
  getGlobalSettings: mocks.getGlobalSettings,
  updateGlobalSettings: mocks.updateGlobalSettings,
}))

vi.mock('./PhotoManager', () => ({
  default: () => <div data-testid="photo-manager">PhotoManager</div>,
}))

describe('GlobalSettingsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初始設定載入失敗時應禁用儲存，避免用預設值覆寫設定', async () => {
    mocks.getGlobalSettings.mockRejectedValueOnce(new Error('network error'))

    render(<GlobalSettingsManager />)

    await waitFor(() => {
      expect(screen.getByText('載入設定失敗')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: '儲存設定' })
    expect(saveButton).toBeDisabled()

    await userEvent.click(saveButton)
    expect(mocks.updateGlobalSettings).not.toHaveBeenCalled()
  })
})
