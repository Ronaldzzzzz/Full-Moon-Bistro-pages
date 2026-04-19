// src/components/guestbook/MessageCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MessageCard from './MessageCard'
import type { Message } from '../../types'
import type { Timestamp } from 'firebase/firestore'

vi.mock('../../lib/firestore', () => ({
  likeMessage: vi.fn().mockResolvedValue(undefined),
}))

const mockMessage: Message = {
  id: 'msg1',
  authorId: '光之戰士',
  serverName: 'Gaia',
  isAnonymous: false,
  content: '咖啡很好喝！',
  timestamp: { toDate: () => new Date('2026-04-15') } as unknown as Timestamp,
  likes: 3,
  dislikes: 1,
  replies: [],
}

describe('MessageCard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('顯示作者 ID 與伺服器名稱', () => {
    render(<MessageCard message={mockMessage} />)
    expect(screen.getByText('光之戰士')).toBeInTheDocument()
    expect(screen.getByText(/@Gaia/)).toBeInTheDocument()
  })

  it('匿名留言顯示「匿名」', () => {
    render(<MessageCard message={{ ...mockMessage, isAnonymous: true }} />)
    expect(screen.getByText('匿名')).toBeInTheDocument()
  })

  it('顯示按讚與倒讚數量', () => {
    render(<MessageCard message={mockMessage} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('顯示留言內容', () => {
    render(<MessageCard message={mockMessage} />)
    expect(screen.getByText('咖啡很好喝！')).toBeInTheDocument()
  })
})
