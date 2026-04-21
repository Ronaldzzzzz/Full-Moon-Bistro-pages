import type { MenuItem } from '../../types'

interface Props {
  item: MenuItem
}

export default function MenuItemRow({ item }: Props) {
  return (
    <li
      role="listitem"
      className={`flex items-center gap-4 bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded p-3 transition-all hover:bg-[var(--color-bg-card-hover)] hover:shadow-[var(--shadow-glow-warm)] ${
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
        <div className="text-[#d4c090] font-bold text-xl content-text tracking-wide">{item.name}</div>
        <div className="text-[var(--color-text-muted)] text-md mt-1 line-clamp-2 opacity-70 leading-relaxed">{item.description}</div>
      </div>

      {/* 價格 + 狀態 */}
      <div className="flex-shrink-0 text-right">
        <div className="text-[#c9a55a] text-base font-semibold content-text">{item.price} gil</div>
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
