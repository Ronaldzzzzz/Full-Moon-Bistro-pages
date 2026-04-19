import { useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../../lib/firestore'
import type { MenuItem, MenuCategory } from '../../types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../types'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: 0,
  category: 'appetizer' as MenuCategory,
  imageUrl: '',
  available: true,
  order: 0,
}

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getMenuItems()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(item: MenuItem) {
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
      order: item.order,
    })
    setImageFile(null)
    setShowForm(true)
  }

  function startNew() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, order: items.length })
    setImageFile(null)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = form.imageUrl
      if (imageFile) {
        const storageRef = ref(storage, `menuItems/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }
      const data = { ...form, imageUrl }
      if (editing) {
        await updateMenuItem(editing.id, data)
      } else {
        await addMenuItem(data)
      }
      setShowForm(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(item: MenuItem) {
    await updateMenuItem(item.id, { available: !item.available })
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此品項？')) return
    await deleteMenuItem(id)
    await load()
  }

  const grouped = CATEGORY_ORDER.reduce<Record<MenuCategory, MenuItem[]>>(
    (acc, cat) => ({ ...acc, [cat]: items.filter((i) => i.category === cat) }),
    {} as Record<MenuCategory, MenuItem[]>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[#9a8a70] text-sm">{items.length} 個品項</span>
        <button
          onClick={startNew}
          className="bg-[#c9a55a] text-[#1a1510] text-sm font-semibold px-4 py-1.5 rounded hover:bg-[#d4af7a] transition-colors"
        >
          ＋ 新增品項
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-[#2a2015] border border-[#6a5030] rounded p-4 mb-6 flex flex-col gap-3"
        >
          <h3 className="text-[#c9a55a] text-sm font-semibold">
            {editing ? '編輯品項' : '新增品項'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="品項名稱 *"
              required
              className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a]"
            />
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              placeholder="價格 (gil)"
              required
              min={0}
              className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a]"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="描述"
            rows={2}
            className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a] resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })}
              className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] focus:outline-none focus:border-[#c9a55a]"
            >
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              placeholder="排序編號"
              min={0}
              className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-1.5 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a]"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-sm text-[#9a8a70] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#3a2e18] file:text-[#c9a55a] file:text-xs"
          />

          <label className="flex items-center gap-2 text-xs text-[#9a8a70] cursor-pointer">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="accent-[#c9a55a]"
            />
            供應中
          </label>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-[#9a8a70] hover:text-[#d4c090] px-3 py-1.5"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#c9a55a] text-[#1a1510] text-sm font-semibold px-5 py-1.5 rounded hover:bg-[#d4af7a] disabled:opacity-50 transition-colors"
            >
              {saving ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[#9a8a70] text-sm">載入中…</p>
      ) : (
        CATEGORY_ORDER.map((cat) =>
          grouped[cat].length > 0 ? (
            <div key={cat} className="mb-6">
              <h4 className="text-[#c9a55a] text-xs tracking-widest mb-2 border-b border-[#4a3820] pb-1">
                {CATEGORY_LABELS[cat]}
              </h4>
              <div className="flex flex-col gap-2">
                {grouped[cat].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-[#2a2015] border border-[#4a3820] rounded p-2.5"
                  >
                    <div className="w-10 h-10 rounded bg-[#3a2e18] flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          🍽
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#d4c090] text-sm font-semibold">{item.name}</span>
                      <span className="text-[#c9a55a] text-xs ml-2">{item.price} gil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`text-xs px-2 py-0.5 rounded ${
                          item.available
                            ? 'bg-[#1e3a1e] text-[#81c784]'
                            : 'bg-[#3a1e1e] text-[#ef9a9a]'
                        }`}
                      >
                        {item.available ? '供應中' : '已下架'}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="text-xs text-[#9a8a70] hover:text-[#d4c090] px-2 py-0.5"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-[#6a3030] hover:text-[#ef9a9a] px-2 py-0.5"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )
      )}
    </div>
  )
}
