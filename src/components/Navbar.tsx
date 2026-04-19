// src/components/Navbar.tsx
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1 text-sm transition-colors ${
      isActive
        ? 'text-[#d4af7a] border-b border-[#c9a55a]'
        : 'text-[#9a8a70] hover:text-[#d4c090]'
    }`

  return (
    <nav className="border-b border-[#4a3820] bg-[#1a1510]">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
        <span className="font-serif text-[#c9a55a] text-sm tracking-widest">
          ✦ THE SEVENTH HAVEN ✦
        </span>
        <div className="flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            菜單
          </NavLink>
          <NavLink to="/guestbook" className={linkClass}>
            留言板
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `ml-3 text-[#6a5030] hover:text-[#9a8060] transition-colors text-xs ${isActive ? 'text-[#9a8060]' : ''}`
            }
          >
            ⚙
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
