import { useEffect, useState } from 'react'
import { getLiveMusicConfig } from '../lib/firestore'
import type { LiveMusicConfig } from '../types'

export default function LiveMusicBanner() {
  const [config, setConfig] = useState<LiveMusicConfig | null>(null)

  useEffect(() => {
    getLiveMusicConfig().then(setConfig)
  }, [])

  if (!config || !config.isActive || !config.content) return null

  return (
    <div className="mb-6 p-3 rounded border border-[var(--color-gold-primary)]/30 bg-[var(--color-bg-card)] shadow-[var(--shadow-glow-warm)] flex items-center gap-3">
      <span className="text-xl animate-pulse">🎶</span>
      <div className="flex-1">
        <p className="text-[var(--color-gold-primary)] text-sm font-medium tracking-wide">
          {config.content}
        </p>
      </div>
    </div>
  )
}
