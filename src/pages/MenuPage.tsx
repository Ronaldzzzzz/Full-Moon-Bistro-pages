import { useEffect, useState } from 'react'
import type { MenuItem } from '../types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types'
import { getMenuItems } from '../lib/firestore'
import MenuItemRow from '../components/menu/MenuItemRow'
import LiveMusicBanner from '../components/LiveMusicBanner'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMenuItems()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Banner */}
      <div className="border border-[var(--color-border-gold)] rounded p-6 text-center bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-card-hover)] shadow-[var(--shadow-glow-warm)] banner-shimmer">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-widest text-shimmer mb-2">✦ 月圓餐館 - FULL MOON BISTRO ✦</h1>
        <p className="text-[var(--color-text-muted)] text-xs md:text-sm mt-1 tracking-[0.3em] font-medium">MOONLIGHT & MELODY</p>
        <div className="mt-2 wave-divider" />
      </div>

      <LiveMusicBanner />

      {/* 品項清單 (分組顯示) */}
      <div className="flex flex-col gap-10">
        {loading ? (
          <p className="text-[#a68b6d] text-sm text-center py-8">載入中…</p>
        ) : items.length === 0 ? (
          <p className="text-[#a68b6d] text-sm text-center py-8">目前無菜單品項</p>
        ) : (
          CATEGORY_ORDER.map(cat => (
            grouped[cat].length > 0 && (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-[var(--color-gold-primary)] font-serif text-sm tracking-widest uppercase">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <div className="flex-1 h-px bg-[var(--color-border-gold)] opacity-30" />
                </div>
                <ul className="flex flex-col gap-3">
                  {grouped[cat].map((item) => (
                    <MenuItemRow key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            )
          ))
        )}
      </div>
    </div>
  )
}
