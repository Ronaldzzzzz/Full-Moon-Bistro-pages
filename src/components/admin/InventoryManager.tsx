import { useEffect, useState } from 'react'
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../../lib/firestore'
import type { InventoryItem } from '../../types'

const EMPTY_FORM = { name: '', stock: 0, unit: '份', note: '' }

export default function InventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getInventoryItems()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(item: InventoryItem) {
    setEditing(item)
    setForm({ name: item.name, stock: item.stock, unit: item.unit, note: item.note })
    setShowForm(true)
  }

  function startNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

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
    if (!confirm('確定要刪除此庫存項目？')) return
    await deleteInventoryItem(id)
    await load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[#9a8a70] text-sm">{items.length} 項食材</span>
        <button onClick={startNew} className="bg-[#c9a55a] text-[#1a1510] text-sm font-semibold px-4 py-1.5 rounded hover:bg-[#d4af7a] transition-colors">
          ＋ 新增食材
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-[#2a2015] border border-[#6a5030] rounded p-4 mb-6 flex flex-col gap-3">
          <h3 className="text-[#c9a55a] text-sm font-semibold">{editing ? '編輯食材' : '新增食材'}</h3>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="食材名稱 *" required className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a]" />
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="數量" min={0} className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a]" />
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="單位（份/瓶/克）" className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a]" />
          </div>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="備註" className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a]" />
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
      ) : items.length === 0 ? (
        <p className="text-[#9a8a70] text-sm text-center py-8">尚無食材記錄</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-[#2a2015] border border-[#4a3820] rounded p-3">
              <div className="flex-1">
                <span className="text-[#d4c090] text-sm font-semibold">{item.name}</span>
                {item.note && <span className="text-[#6a5030] text-xs ml-2">{item.note}</span>}
              </div>
              <span className="text-[#c9a55a] text-sm font-semibold">{item.stock} {item.unit}</span>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="text-xs text-[#9a8a70] hover:text-[#d4c090] px-2 py-0.5">編輯</button>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-[#6a3030] hover:text-[#ef9a9a] px-2 py-0.5">刪除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
