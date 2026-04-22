// src/components/PhotoCard.tsx
import { useState } from 'react'
import type { PhotoUrl } from '../types'

interface Props {
  photoUrls: PhotoUrl[]
}

const rotations = ['rotate-[-2deg]', 'rotate-[2deg]', 'rotate-[-1.5deg]', 'rotate-[1.5deg]']

export default function PhotoCard({ photoUrls }: Props) {
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  if (photoUrls.length === 0) return null

  return (
    <>
      {/* 拍立得相框 - 固定於左側中間，手機版隱藏 */}
      <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-10 flex-col gap-4">
        {photoUrls.slice(0, 3).map((entry, index) => (
          <button
            key={entry.url}
            onClick={() => setModalIndex(index)}
            className={`
              relative cursor-pointer transition-transform duration-200
              hover:scale-105 focus:outline-none
              ${rotations[index % rotations.length]}
            `}
            aria-label={`查看宣傳照 ${index + 1}`}
          >
            {/* 拍立得相框外框 */}
            <div
              className="bg-white shadow-xl"
              style={{
                border: '2px solid #c9a55a',
                padding: '6px 6px 20px 6px',
                width: '100px',
              }}
            >
              {/* 照片本體 */}
              <img
                src={entry.url}
                alt={`宣傳照 ${index + 1}`}
                className="w-full object-cover"
                style={{ height: '120px' }}
              />
              {/* 底部白色文字區 */}
              <div
                className="w-full flex items-center justify-center"
                style={{ height: '14px' }}
              >
                <span className="text-[#c9a55a] text-[8px] font-serif tracking-widest select-none">
                  ✦
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 全螢幕 Modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="relative max-w-screen-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 拍立得大相框 */}
            <div
              className="bg-white mx-auto shadow-2xl"
              style={{
                border: '3px solid #c9a55a',
                padding: '12px 12px 48px 12px',
                maxWidth: '480px',
              }}
            >
              <img
                src={photoUrls[modalIndex].url}
                alt={`宣傳照 ${modalIndex + 1}`}
                className="w-full object-contain max-h-[70vh]"
              />
              <div className="w-full flex items-center justify-center" style={{ height: '24px' }}>
                <span className="text-[#c9a55a] text-xs font-serif tracking-[0.5em] select-none">
                  ✦ FULL MOON BISTRO ✦
                </span>
              </div>
            </div>

            {/* 上一張 / 下一張按鈕 */}
            {photoUrls.length > 1 && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setModalIndex((modalIndex - 1 + photoUrls.length) % photoUrls.length)}
                  className="text-[#c9a55a] border border-[#c9a55a] rounded px-4 py-1.5 text-sm hover:bg-[#c9a55a]/20 transition-colors"
                >
                  ← 上一張
                </button>
                <span className="text-[#a68b6d] text-sm self-center">
                  {modalIndex + 1} / {photoUrls.length}
                </span>
                <button
                  onClick={() => setModalIndex((modalIndex + 1) % photoUrls.length)}
                  className="text-[#c9a55a] border border-[#c9a55a] rounded px-4 py-1.5 text-sm hover:bg-[#c9a55a]/20 transition-colors"
                >
                  下一張 →
                </button>
              </div>
            )}

            {/* 關閉按鈕 */}
            <button
              onClick={() => setModalIndex(null)}
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
              aria-label="關閉"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
