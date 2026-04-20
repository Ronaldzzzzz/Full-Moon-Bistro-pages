import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1 text-sm transition-colors ${
      isActive
        ? 'text-[var(--color-gold-light)] border-b border-[var(--color-gold-primary)]'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
    }`

  return (
    <nav className="border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
        <span className="font-serif text-[var(--color-gold-primary)] text-sm tracking-widest flex items-center gap-1">
          <span className="animate-[moon-pulse_3s_infinite]">🌙</span>
          FULL-MOON-BISTRO
          <span>🪕</span>
        </span>
        <div className="flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            菜單
          </NavLink>
          <NavLink to="/guestbook" className={linkClass}>
            留言板
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) =>
            `ml-3 text-[#6a5030] hover:text-[#9a8060] transition-colors text-xs ${isActive ? 'text-[#9a8060]' : ''}`
          }>
            ⚙
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
