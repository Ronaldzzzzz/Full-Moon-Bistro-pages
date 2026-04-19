// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import MenuPage from './pages/MenuPage'
import GuestbookPage from './pages/GuestbookPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen" style={{ backgroundColor: '#1a1510' }}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/guestbook" element={<GuestbookPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
