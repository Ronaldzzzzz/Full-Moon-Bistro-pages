import type { MenuItem } from '../../types'

interface Props {
  item: MenuItem
}

export default function MenuItemRow({ item }: Props) {
  return (
    <li
      role="listitem"
      className={`flex items-center gap-4 bg-[#2a2015] border border-[#4a3820] rounded p-3 transition-colors hover:bg-[#342a1a] ${
        !item.available ? 'opacity-50' : ''
      }`}
    >
      {/* 縮圖 */}
      <div className="w-14 h-14 rounded bg-[#3a2e18] flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽</div>
        )}
      </div>

      {/* 名稱 + 描述 */}
      <div className="flex-1 min-w-0">
        <div className="text-[#d4c090] font-semibold text-sm">{item.name}</div>
        <div className="text-[#9a8a70] text-xs mt-0.5 line-clamp-2">{item.description}</div>
      </div>

      {/* 價格 + 狀態 */}
      <div className="flex-shrink-0 text-right">
        <div className="text-[#c9a55a] text-sm font-semibold">{item.price} gil</div>
        <div
          className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
            item.available
              ? 'bg-[#1e3a1e] text-[#81c784]'
              : 'bg-[#3a1e1e] text-[#ef9a9a]'
          }`}
        >
          {item.available ? '供應中' : '已售完'}
        </div>
      </div>
    </li>
  )
}
