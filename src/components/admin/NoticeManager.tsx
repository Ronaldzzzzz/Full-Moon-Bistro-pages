import { useEffect, useState } from 'react'
import { getNotices, addNotice, updateNotice } from '../../lib/firestore'
import type { NoticeConfig } from '../../types'

export default function NoticeManager() {
  const [notice, setNotice] = useState<NoticeConfig | null>(null)
  const [emoji, setEmoji] = useState('📢')
  const [linesText, setLinesText] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotices().then(notices => {
      if (notices.length > 0) {
        const active = notices[0] // Get the most recent one
        setNotice(active)
        setEmoji(active.emoji)
        setIsActive(active.isActive !== false) // Default to true
        setLinesText(active.lines.join('\n'))
      }
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const lines = linesText.split('\n').map(l => l.trim()).filter(Boolean)
    try {
      if (notice) {
        await updateNotice(notice.id, { emoji, lines, isActive })
      } else {
        const id = await addNotice({ emoji, lines, isActive })
        setNotice({ id, emoji, lines, isActive, updatedAt: new Date() } as NoticeConfig)
      }
      alert('更新成功！')
    } catch (err) {
      alert('更新失敗')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-[var(--color-text-muted)] text-sm">載入中...</div>

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-gold)] rounded p-4 flex flex-col gap-4 shadow-[var(--shadow-glow-warm)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[var(--color-gold-primary)] text-sm font-semibold tracking-widest">注意事項看板管理</h3>
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-[var(--color-gold-primary)]"
          />
          顯示看板
        </label>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)]">看板圖標 (Emoji)</label>
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📢"
          className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold-primary)] w-20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)]">看板內容 (每一行為一條內容)</label>
        <textarea
          value={linesText}
          onChange={(e) => setLinesText(e.target.value)}
          placeholder="第一行內容&#10;第二行內容..."
          className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[#6a5030] focus:outline-none focus:border-[var(--color-gold-primary)] resize-none"
          rows={5}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="self-end bg-[var(--color-gold-primary)] text-[var(--color-bg-primary)] text-sm font-semibold px-5 py-1.5 rounded hover:bg-[var(--color-gold-light)] disabled:opacity-50 transition-colors"
      >
        {saving ? '儲存中...' : '更新注意事項'}
      </button>
    </div>
  )
}
