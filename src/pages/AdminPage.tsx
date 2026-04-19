import { useState, useEffect } from 'react'
import { onAuthChange, getAdminSession, signOutAdmin } from '../lib/auth'
import type { AdminSession } from '../types'
import PasswordGate from '../components/admin/PasswordGate'
import MenuManager from '../components/admin/MenuManager'
import InventoryManager from '../components/admin/InventoryManager'
import MessageManager from '../components/admin/MessageManager'

type AdminTab = 'menu' | 'inventory' | 'messages'

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(getAdminSession)
  const [tab, setTab] = useState<AdminTab>('menu')

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (!user) setSession(null)
    })
    return unsub
  }, [])

  if (!session) {
    return <PasswordGate onSuccess={setSession} />
  }

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'menu', label: '菜單管理' },
    { key: 'inventory', label: '食材庫存' },
    { key: 'messages', label: '留言管理' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-[#d4af7a] tracking-widest">⚙ 後台管理</h2>
        <div className="flex items-center gap-3">
          <span className="text-[#6a5030] text-xs">{session.label}</span>
          <button
            onClick={() => signOutAdmin().then(() => setSession(null))}
            className="text-xs text-[#6a3030] hover:text-[#ef9a9a] transition-colors"
          >
            登出
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              tab === key
                ? 'bg-[#c9a55a] text-[#1a1510] font-semibold'
                : 'bg-[#2a2015] border border-[#4a3820] text-[#9a8a70] hover:text-[#d4c090]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'menu' && <MenuManager />}
      {tab === 'inventory' && <InventoryManager />}
      {tab === 'messages' && <MessageManager />}
    </div>
  )
}
