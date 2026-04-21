import { useEffect, useState } from 'react'
import { getNotices } from '../lib/firestore'
import type { NoticeConfig } from '../types'

export default function NoticeBanner() {
  const [notices, setNotices] = useState<NoticeConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotices()
      .then(data => {
        // 只保留 isActive 為 true 的公告 (或者是舊資料中沒有 isActive 欄位的)
        setNotices(data.filter(n => n.isActive !== false))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || notices.length === 0) return null

  const activeNotice = notices[0] // 取最新的一筆
  const displayContent = activeNotice.lines.join(' | ')
  const displayEmoji = activeNotice.emoji || '📢'

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
