import { useState, useEffect, useRef } from 'react'
import type { MasterItem } from '../../lib/recipeUtils'

interface ItemSearchBoxProps {
  onSelect: (id: number, item: MasterItem) => void
}

export default function ItemSearchBox({ onSelect }: ItemSearchBoxProps) {
  const [items, setItems] = useState<Record<number, MasterItem>>({})
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<[number, MasterItem][]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/data/master_items.json')
        const data = await res.json()
        setItems(data)
      } catch (err) {
        console.error('Failed to load master_items.json:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim() || Object.keys(items).length === 0) {
      setResults([])
      setIsOpen(false)
      return
    }

    const q = query.toLowerCase()
    const filtered: [number, MasterItem][] = []
    
    // Search by ID or Name
    for (const [idStr, item] of Object.entries(items)) {
      const id = Number(idStr)
      if (idStr.includes(q) || item.n.toLowerCase().includes(q)) {
        filtered.push([id, item])
        if (filtered.length >= 20) break
      }
    }

    setResults(filtered)
    setIsOpen(filtered.length > 0)
  }, [query, items])

  const handleSelect = (id: number, item: MasterItem) => {
    onSelect(id, item)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          placeholder={loading ? "載入物品資料中..." : "🔍 搜尋全物品 (名稱或 ID)..."}
          disabled={loading}
          className="w-full bg-[#1a1510] border border-[#c9a55a]/30 rounded px-3 py-2 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a] transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#c9a55a]/30 border-t-[#c9a55a] rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-[#2a2015] border border-[#c9a55a]/50 rounded shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
          {results.map(([id, item]) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id, item)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#3a2e18] transition-colors border-b border-[#4a3820] last:border-0 text-left"
            >
              <img 
                src={`https://xivapi.com${item.i}`} 
                alt={item.n} 
                className="w-8 h-8 rounded bg-[#1a1510] border border-[#4a3820]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://xivapi.com/i/000000/000001_hr1.png'
                }}
              />
              <div className="flex flex-col">
                <span className="text-sm text-[#d4c090] font-medium">{item.n}</span>
                <span className="text-[10px] text-[#6a5030]">ID: {id}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
