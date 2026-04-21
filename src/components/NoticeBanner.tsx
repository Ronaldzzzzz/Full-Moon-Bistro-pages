import { useEffect, useState } from 'react'
import { getNotices } from '../lib/firestore'
import type { NoticeConfig } from '../types'

const DEFAULT_NOTICES = [
  '點飲料一杯即附上店長的隨機餐點',
  '飲品可外帶，但餐點恕不外帶',
  '請尊重其他客人。如果發現嚴重騷擾其他客人，本店恕不接待。'
]

export default function NoticeBanner() {
  const [notices, setNotices] = useState<NoticeConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotices()
      .then(setNotices)
      .finally(() => setLoading(false))
  }, [])

  const activeNotice = notices.find(n => n.isActive)
  
  if (loading) return null

  const displayContent = activeNotice?.content || DEFAULT_NOTICES.join(' | ')
  const displayEmoji = activeNotice?.emoji || '📢'

  return (
    <div className="mb-6 p-3 rounded border border-[var(--color-gold-primary)]/30 bg-[var(--color-bg-card)] shadow-[var(--shadow-glow-warm)] flex items-center gap-3">
      <span className="text-xl animate-pulse">{displayEmoji}</span>
      <div className="flex-1">
        <p className="text-[var(--color-gold-primary)] text-sm font-medium tracking-wide leading-relaxed">
          {displayContent}
        </p>
      </div>
    </div>
  )
}
