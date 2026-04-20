import { useEffect, useState } from 'react'
import type { MenuItem, MenuCategory } from '../types'
import { getMenuItems } from '../lib/firestore'
import CategoryTabs from '../components/menu/CategoryTabs'
import MenuItemRow from '../components/menu/MenuItemRow'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('appetizer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMenuItems()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((i) => i.category === activeCategory)

  return (
    <div>
      {/* Banner */}
      <div className="border border-[var(--color-border-gold)] rounded p-4 mb-6 text-center bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-card-hover)] shadow-[var(--shadow-glow-warm)]">
        <h1 className="font-serif text-[var(--color-gold-primary)] text-xl tracking-widest">✦ FULL-MOON-BISTRO (月圓餐館) ✦</h1>
        <p className="text-[var(--color-text-muted)] text-xs mt-1 tracking-wider">MOONLIGHT & MELODY</p>
        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[var(--color-border-gold)] to-transparent" />
      </div>

      {/* 分類頁籤 */}
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      {/* 品項清單 */}
      <div className="mt-4">
        {loading ? (
          <p className="text-[#9a8a70] text-sm text-center py-8">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="text-[#9a8a70] text-sm text-center py-8">目前無此分類品項</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <MenuItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
