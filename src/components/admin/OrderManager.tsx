import { useState, useEffect } from 'react'
import type { Order } from '../../types'
import { getOrders, deleteOrder } from '../../lib/firestore'

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error('載入訂單失敗:', err)
      setError('載入訂單失敗，請重新整理。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('確定刪除此筆訂單？')) return
    setDeleting(id)
    try {
      await deleteOrder(id)
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      console.error('刪除訂單失敗:', err)
      alert('刪除失敗，請稍後再試。')
    } finally {
      setDeleting(null)
    }
  }

  function formatTime(order: Order): string {
    try {
      const date = order.timestamp?.toDate?.()
      if (!date) return '—'
      return date.toLocaleString('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return '—'
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#c9a55a] font-serif tracking-widest text-lg">點餐管理</h3>
        <button
          onClick={load}
          className="text-xs text-[#9a8a70] hover:text-[#d4c090] transition-colors border border-[#4a3820] px-3 py-1 rounded"
        >
          重新整理
        </button>
      </div>

      {error && (
        <p className="text-[#ef9a9a] text-sm text-center py-2 border border-[#6a3030] rounded bg-[#2a1515] px-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[#9a8a70] text-sm text-center py-8">載入中…</p>
      ) : orders.length === 0 ? (
        <p className="text-[#9a8a70] text-sm text-center py-8">目前無訂單</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map(order => (
            <li
              key={order.id}
              className="bg-[#2a2015] border border-[#4a3820] rounded p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#d4c090] text-sm font-semibold">{order.customerName}</span>
                  <span className="text-[#9a8a70] text-xs">{formatTime(order)}</span>
                </div>
                <button
                  onClick={() => handleDelete(order.id)}
                  disabled={deleting === order.id}
                  className="text-xs text-[#6a3030] hover:text-[#ef9a9a] transition-colors border border-[#4a2020] hover:border-[#6a3030] px-3 py-1 rounded disabled:opacity-50"
                >
                  {deleting === order.id ? '刪除中…' : '刪除'}
                </button>
              </div>

              <ul className="flex flex-col gap-0.5 pl-2 border-l border-[#4a3820]">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#a89060]">
                    ✦ {item.menuItemName}
                    {item.quantity > 1 && <span className="text-[#9a8a70]"> × {item.quantity}</span>}
                  </li>
                ))}
              </ul>

              {order.note && (
                <p className="text-xs text-[#9a8a70] italic mt-0.5">備註：{order.note}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
