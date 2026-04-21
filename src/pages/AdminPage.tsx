import { useState, useEffect } from 'react'
import { onAuthChange, getAdminSession, signOutAdmin } from '../lib/auth'
import type { AdminSession } from '../types'
import PasswordGate from '../components/admin/PasswordGate'
import MenuManager from '../components/admin/MenuManager'
import InventoryManager from '../components/admin/InventoryManager'
import MessageManager from '../components/admin/MessageManager'
import AdminManager from '../components/admin/AdminManager'
import NoticeManager from '../components/admin/NoticeManager'

type AdminTab = 'menu' | 'inventory' | 'messages' | 'admins' | 'notice'

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

  const tabs: { key: AdminTab; label: string; minRole?: string }[] = [
    { key: 'menu', label: '菜單管理' },
    { key: 'inventory', label: '食材庫存' },
    { key: 'messages', label: '留言管理' },
    { key: 'notice', label: '注意事項' },
    { key: 'admins', label: '帳號管理', minRole: 'owner' },
  ]

  const visibleTabs = tabs.filter(t => !t.minRole || t.minRole === session.role)

  return (
    <div className="admin-content">
      {/* 後台頂部 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-[var(--color-gold-primary)] tracking-widest">⚙ 後台管理</h2>
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-text-muted)] text-xs capitalize">{session.role}: {session.label}</span>
          <button
            onClick={() => signOutAdmin().then(() => setSession(null))}
            className="text-xs text-[#6a3030] hover:text-[#ef9a9a] transition-colors"
          >
            登出
          </button>
        </div>
      </div>

      {/* 分頁頁籤 */}
      <div className="flex gap-1 mb-6">
        {visibleTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              tab === key
                ? 'bg-[var(--color-gold-primary)] text-[var(--color-bg-primary)] font-semibold shadow-[var(--shadow-glow-warm)]'
                : 'bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'menu' && <MenuManager />}
      {tab === 'inventory' && <InventoryManager />}
      {tab === 'messages' && <MessageManager />}
      {tab === 'notice' && <NoticeManager />}
      {tab === 'admins' && session.role === 'owner' && <AdminManager />}
    </div>
  )
}
