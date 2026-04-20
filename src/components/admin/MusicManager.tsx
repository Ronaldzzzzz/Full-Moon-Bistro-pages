import { useEffect, useState } from 'react'
import { getLiveMusicConfig, updateLiveMusicConfig } from '../../lib/firestore'

export default function MusicManager() {
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getLiveMusicConfig().then(config => {
      if (config) {
        setContent(config.content)
        setIsActive(config.isActive)
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await updateLiveMusicConfig({ content, isActive })
      alert('更新成功！')
    } catch (err) {
      alert('更新失敗')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-gold)] rounded p-4 flex flex-col gap-4 shadow-[var(--shadow-glow-warm)]">
      <h3 className="text-[var(--color-gold-primary)] text-sm font-semibold tracking-widest">今日駐演看板管理</h3>
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <input 
          type="checkbox" 
          checked={isActive} 
          onChange={(e) => setIsActive(e.target.checked)}
          className="accent-[var(--color-gold-primary)]"
        />
        啟用看板顯示
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="例如：今晚 8 點：吟遊詩人現場演奏..."
        className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[#6a5030] focus:outline-none focus:border-[var(--color-gold-primary)] resize-none"
        rows={3}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="self-end bg-[var(--color-gold-primary)] text-[var(--color-bg-primary)] text-sm font-semibold px-5 py-1.5 rounded hover:bg-[var(--color-gold-light)] disabled:opacity-50 transition-colors"
      >
        {saving ? '儲存中...' : '更新看板'}
      </button>
    </div>
  )
}
