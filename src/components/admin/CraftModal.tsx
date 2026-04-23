import { useState } from 'react'
import type { MenuItem, InventoryItem } from '../../types'
import { craftMenuItemBatch } from '../../lib/firestore'

interface Props {
  menuItem: MenuItem
  inventoryItems: InventoryItem[]
  onClose: () => void
  onCrafted: () => void
}

export default function CraftModal({ menuItem, inventoryItems, onClose, onCrafted }: Props) {
  const ingredients = menuItem.ingredients ?? []

  const resolved = ingredients.map(ing => {
    const inv = inventoryItems.find(it => it.recipeIngredientId === ing.id)
    return { ing, inv }
  })

  const maxCraft = resolved.length === 0 ? 0 : Math.floor(
    Math.min(...resolved.map(({ ing, inv }) =>
      inv ? Math.floor((inv.stock ?? 0) / ing.amount) : 0
    ))
  )

  const [qty, setQty] = useState(Math.max(1, maxCraft))
  const [crafting, setCrafting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCraft() {
    if (qty <= 0 || crafting) return
    setCrafting(true)
    setError(null)
    try {
      const deductions = resolved
        .filter(({ inv }) => !!inv)
        .map(({ ing, inv }) => ({ inventoryItemId: inv!.id, amount: ing.amount * qty }))
      await craftMenuItemBatch(menuItem.id, qty, deductions)
      onCrafted()
      onClose()
    } catch (err) {
      console.error('製作失敗:', err)
      setError('製作失敗，請確認庫存是否足夠。')
    } finally {
      setCrafting(false)
    }
  }

  const canCraft = qty > 0 && qty <= maxCraft && resolved.every(({ inv }) => !!inv)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#1e1a10] border border-[#6a5030] rounded-lg p-5 w-full max-w-md flex flex-col gap-4 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 標題 */}
        <div className="flex items-center gap-3">
          {menuItem.imageUrl && (
            <img src={menuItem.imageUrl} alt={menuItem.name} className="w-10 h-10 rounded object-cover" />
          )}
          <div>
            <h3 className="text-[#c9a55a] font-serif tracking-wide text-base">
              製作：{menuItem.alias || menuItem.name}
            </h3>
            <p className="text-[#9a8a70] text-xs mt-0.5">
              現有成品庫存：<span className="text-[#d4c090]">{menuItem.stock ?? 0}</span>
            </p>
          </div>
        </div>

        {/* 食材列表 */}
        {resolved.length === 0 ? (
          <p className="text-[#9a8a70] text-sm">此品項無設定食材配方。</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-[#9a8a70] tracking-wide mb-1">所需食材</p>
            {resolved.map(({ ing, inv }) => {
              const need = ing.amount * qty
              const have = inv?.stock ?? 0
              const sufficient = have >= need
              return (
                <div key={ing.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-[#2a2015] border border-[#3a2c1a]">
                  <span className={inv ? 'text-[#d4c090]' : 'text-[#ef9a9a]'}>
                    {inv?.name ?? `食材 #${ing.id}`}
                  </span>
                  <span className={sufficient ? 'text-[#81c784]' : 'text-[#ef9a9a]'}>
                    {have} / 需 {need}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* 數量輸入 */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-[#9a8a70] whitespace-nowrap">製作數量</label>
          <input
            type="number"
            min={1}
            max={maxCraft || 1}
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-[#2d1e12] border border-[#8b6b4a] text-[#e8d5b5] rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-[#c9a55a]"
          />
          <span className="text-xs text-[#9a8a70]">最多可製作 {maxCraft} 份</span>
        </div>

        {error && <p className="text-[#ef9a9a] text-xs">{error}</p>}

        {/* 按鈕列 */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="text-sm text-[#9a8a70] hover:text-[#d4c090] px-4 py-1.5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCraft}
            disabled={!canCraft || crafting}
            className="text-sm bg-[#c9a55a] text-[#1a1510] font-semibold px-5 py-1.5 rounded hover:bg-[#d4af7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {crafting ? '製作中…' : `確認製作 ×${qty}`}
          </button>
        </div>
      </div>
    </div>
  )
}
