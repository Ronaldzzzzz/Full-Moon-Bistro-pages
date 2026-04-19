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
      <div className="border border-[#6a5030] rounded p-4 mb-6 text-center bg-gradient-to-r from-[#2a1f0e] to-[#3d2c12]">
        <h1 className="font-serif text-[#d4af7a] text-xl tracking-widest">✦ THE SEVENTH HAVEN ✦</h1>
        <p className="text-[#8a6a40] text-xs mt-1 tracking-wider">CAFÉ & TEA HOUSE</p>
        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[#6a5030] to-transparent" />
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
