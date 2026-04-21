import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  deleteInventoryItems,
} from '../../lib/firestore'
import type { InventoryItem } from '../../types'
import type { MasterRecipe } from '../../lib/recipeUtils'

const EMPTY_FORM = {
  name: '',
  stock: 0,
  note: '',
}

// 簡易防抖計時器
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// 樹狀節點介面
interface InventoryNode extends InventoryItem {
  children: InventoryNode[];
}

export default function InventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [masterRecipes, setMasterRecipes] = useState<Record<number, MasterRecipe>>({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // 批量選取狀態
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Toast 狀態
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ msg, type })
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [invData, recipesRes] = await Promise.all([
        getInventoryItems(),
        fetch('/Full-Moon-Bistro-pages/data/master_recipes.json').then(r => r.json())
      ])
      setItems(invData)
      setMasterRecipes(recipesRes)
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Failed to load inventory data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load()
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // 核心邏輯：將扁平列表轉換為樹狀結構
  const inventoryTrees = useMemo(() => {
    if (items.length === 0) return [];

    const nodes: Record<string, InventoryNode> = {};
    items.forEach(item => {
      nodes[item.id] = { ...item, children: [] };
    });

    // 建立配方 ID 到庫存項目 ID 的映射
    const recipeIdToInvId: Record<number, string> = {};
    items.forEach(item => {
      if (item.recipeIngredientId) {
        recipeIdToInvId[item.recipeIngredientId] = item.id;
      }
    });

    const childIds = new Set<string>();

    // 建立父子關係
    items.forEach(item => {
      if (item.recipeIngredientId && masterRecipes[item.recipeIngredientId]) {
        const recipe = masterRecipes[item.recipeIngredientId];
        recipe.ings.forEach(ing => {
          const childInvId = recipeIdToInvId[ing.i];
          // 如果該原料也在庫存中，則建立關係
          if (childInvId && nodes[item.id] && childInvId !== item.id) {
            nodes[item.id].children.push(nodes[childInvId]);
            childIds.add(childInvId);
          }
        });
      }
    });

    // 找出頂層項目 (不是任何人的子項)
    return Object.values(nodes)
      .filter(node => !childIds.has(node.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, masterRecipes]);

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i.id)))
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size
    if (count === 0) return
    if (!confirm(`確定要刪除選中的 ${count} 樣食材？`)) return
    
    setSaving(true)
    try {
      await deleteInventoryItems(Array.from(selectedIds))
      showToast(`成功刪除 ${count} 樣食材`)
      await load()
    } catch (err) {
      console.error('Bulk delete failed:', err)
      showToast('批量刪除失敗', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickStockUpdate = (id: string, newStock: number) => {
    if (newStock < 0) return
    
    // 1. 立即更新 UI
    setItems(prev => prev.map(item => item.id === id ? { ...item, stock: newStock } : item))

    // 2. 防抖同步
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        await updateInventoryItem(id, { stock: newStock })
        showToast('庫存同步成功')
      } catch (err) {
        console.error('Failed to update stock:', err)
        showToast('同步失敗，請重新整理', 'error')
        await load() // 回退
      }
    }, 1000)
  }

  // 遞迴渲染函數
  const renderNode = (node: InventoryNode, level: number = 0) => {
    const isSelected = selectedIds.has(node.id);
    
    return (
      <div key={node.id} className="flex flex-col">
        <div 
          onClick={() => handleToggleSelect(node.id)}
          className={`flex items-center gap-3 bg-[#2a2015] border rounded p-3 hover:border-[#6a5030] transition-all cursor-pointer ${
            isSelected ? 'border-[#c9a55a] shadow-[var(--shadow-glow-warm)]' : 'border-[#4a3820]'
          }`}
          style={{ marginLeft: `${level * 1.5}rem` }}
        >
          {/* 層級線 (選配) */}
          {level > 0 && <span className="text-[#6a5030] opacity-50">└─</span>}

          <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
            <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={() => {}} 
              className="accent-[#c9a55a] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="w-8 h-8 rounded bg-black/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#4a3820]">
            {node.icon ? (
              <img src={`https://xivapi.com${node.icon}`} alt="" className="w-full h-full object-contain" />
            ) : (
              <span className="text-lg">📦</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[#d4c090] text-sm font-semibold truncate">{node.name}</div>
            {node.note && <div className="text-[#6a5030] text-[10px] truncate">{node.note}</div>}
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => handleQuickStockUpdate(node.id, node.stock - 1)}
              className="w-6 h-6 flex items-center justify-center bg-[#3a2e18] text-[#c9a55a] rounded hover:bg-[#4a3820] transition-colors text-lg font-bold"
            >
              -
            </button>
            <input 
              type="number"
              value={node.stock}
              onChange={(e) => handleQuickStockUpdate(node.id, parseInt(e.target.value) || 0)}
              className="w-12 bg-[#1a1510] border border-[#4a3820] rounded px-1 py-0.5 text-center text-sm text-[#f4e38e] focus:outline-none focus:border-[#c9a55a]"
            />
            <button 
              onClick={() => handleQuickStockUpdate(node.id, node.stock + 1)}
              className="w-6 h-6 flex items-center justify-center bg-[#3a2e18] text-[#c9a55a] rounded hover:bg-[#4a3820] transition-colors text-lg font-bold"
            >
              +
            </button>
          </div>

          <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => { setEditing(node); setForm({ name: node.name, stock: node.stock, note: node.note }); setShowForm(true); }}
              className="text-xs text-[#9a8a70] hover:text-[#d4c090] p-1"
            >
              ⚙
            </button>
            <button onClick={() => handleDelete(node.id)} className="text-xs text-[#6a3030] hover:text-[#ef9a9a] p-1">✕</button>
          </div>
        </div>
        
        {node.children.length > 0 && (
          <div className="flex flex-col mt-1">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateInventoryItem(editing.id, form)
      } else {
        await addInventoryItem(form)
      }
      setShowForm(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此食材？')) return
    await deleteInventoryItem(id)
    await load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span className="text-[#9a8a70] text-sm">{items.length} 樣食材</span>
          {items.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-[#c9a55a] text-xs hover:underline"
            >
              {selectedIds.size === items.length ? '取消全選' : '全選'}
            </button>
          )}
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={saving}
              className="bg-[#3a1e1e] text-[#ef9a9a] text-xs px-3 py-1 rounded hover:bg-[#4a2222] transition-colors disabled:opacity-50"
            >
              刪除選中 ({selectedIds.size})
            </button>
          )}
        </div>
        <button
          onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}
          className="bg-[#c9a55a] text-[#1a1510] text-sm font-semibold px-4 py-1.5 rounded hover:bg-[#d4af7a] transition-colors"
        >
          ＋ 手動新增食材
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-[#2a2015] border border-[#6a5030] rounded p-4 mb-6 flex flex-col gap-3">
          <h3 className="text-[#c9a55a] text-sm font-semibold">{editing ? '編輯食材' : '新增食材'}</h3>
          <div className="flex flex-col gap-3">
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="食材名稱 *" required 
              className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] focus:outline-none focus:border-[#c9a55a]" 
            />
            <textarea 
              value={form.note} 
              onChange={(e) => setForm({ ...form, note: e.target.value })} 
              placeholder="備註 (如：取得方式)" rows={2} 
              className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] focus:outline-none focus:border-[#c9a55a] resize-none" 
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-[#9a8a70] hover:text-[#d4c090] px-3 py-1.5">取消</button>
            <button type="submit" disabled={saving} className="bg-[#c9a55a] text-[#1a1510] text-sm font-semibold px-5 py-1.5 rounded hover:bg-[#d4af7a] disabled:opacity-50 transition-colors">
              {saving ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[#9a8a70] text-sm">載入中…</p>
      ) : (
        <div className="grid gap-2">
          {inventoryTrees.map(root => renderNode(root))}
          {inventoryTrees.length === 0 && (
            <p className="text-[#9a8a70] text-sm text-center py-8">目前無食材資料</p>
          )}
        </div>
      )}

      {/* Toast 通知 */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-2xl z-[9999] animate-bounce-in ${
          toast.type === 'success' ? 'bg-[#1e3a1e] text-[#81c784] border border-[#81c784]/30' : 'bg-[#3a1e1e] text-[#ef9a9a] border border-[#ef9a9a]/30'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}
