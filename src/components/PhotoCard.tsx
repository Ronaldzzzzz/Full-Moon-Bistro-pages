// src/components/PhotoCard.tsx
import { useState, useEffect } from 'react'
import type { PhotoUrl } from '../types'
import { getCropStyle } from '../utils/photoUtils'

const CONTENT_MAX_WIDTH = 896  // max-w-4xl
const CARD_GROUP_WIDTH = 260   // 200px card + 48px max offset + 12px padding

/** 計算拍立得應擺放的 left 位置；空間不足時回傳 null（隱藏） */
function calcDesktopLeft(windowWidth: number): number | null {
  const leftMargin = Math.max(0, (windowWidth - CONTENT_MAX_WIDTH) / 2)
  if (leftMargin < CARD_GROUP_WIDTH + 30) return null  // 空間不足，隱藏
  // 將相框群置中於左側空白區，並稍微偏右讓它靠近內容
  return Math.floor(leftMargin / 2 - CARD_GROUP_WIDTH / 2 + 16)
}

interface Props {
  photoUrls: PhotoUrl[]
}

const rotations = ['rotate-[-4deg]', 'rotate-[3.5deg]', 'rotate-[-2.5deg]', 'rotate-[1.5deg]']
// z-index 讓中間張疊在最上，視覺更自然
const zIndexes = [1, 3, 2]
// 水平與垂直偏移，製造桌上隨意散落的不規則感
const offsetX = [0, 48, 12]
const offsetY = [0, -10, 6]

export default function PhotoCard({ photoUrls }: Props) {
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const [desktopLeft, setDesktopLeft] = useState<number | null>(() => calcDesktopLeft(window.innerWidth))

  useEffect(() => {
    function handleResize() {
      setDesktopLeft(calcDesktopLeft(window.innerWidth))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (photoUrls.length === 0) return null

  return (
    <>
      {/* 拍立得相框 - 大屏幕固定於左側（動態計算位置），中等屏幕切換到流動布局 */}
      {desktopLeft !== null && (
      <div
        className="hidden lg:flex flex-col items-center"
        style={{
          position: 'fixed',
          left: desktopLeft,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      >
        {photoUrls.slice(0, 3).map((entry, index) => (
          <div
            key={entry.url}
            className={rotations[index % rotations.length]}
            style={{
              width: 200,
              height: 220,
              marginTop: index === 0 ? 0 : -14 + (offsetY[index] ?? 0),
              marginLeft: offsetX[index] ?? 0,
              zIndex: zIndexes[index] ?? 1,
              pointerEvents: 'auto',
              userSelect: 'none',
            }}
          >
            {/* 拍立得相框外框 */}
            <div
              className="bg-white shadow-xl"
              style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                border: '2px solid #c9a55a',
                padding: '10px 10px 0 10px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* 照片本體：點擊開啟 Modal，用 background-image 精確截取 cropData 區域 */}
              <div
                role="img"
                aria-label={`宣傳照 ${index + 1}`}
                style={{
                  width: '100%',
                  height: '172px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  backgroundImage: `url(${entry.url})`,
                  ...getCropStyle(entry.cropData),
                }}
                onClick={() => setModalIndex(index)}
              />
              {/* 底部白色裝飾條 */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[#c9a55a] text-md font-serif tracking-widest select-none">
                  ✦
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* 手機與平板版拍立得 - 流動布局 */}
      <div className="lg:hidden flex flex-col items-center gap-6">
        {photoUrls.slice(0, 3).map((entry, index) => (
          <div
            key={entry.url}
            className={rotations[index % rotations.length]}
            style={{
              width: 160,
              height: 176,
              zIndex: zIndexes[index] ?? 1,
              userSelect: 'none',
            }}
          >
            {/* 拍立得相框外框 */}
            <div
              className="bg-white shadow-xl"
              style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                border: '2px solid #c9a55a',
                padding: '10px 10px 0 10px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* 照片本體 */}
              <div
                role="img"
                aria-label={`宣傳照 ${index + 1}`}
                style={{
                  width: '100%',
                  height: '138px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  backgroundImage: `url(${entry.url})`,
                  ...getCropStyle(entry.cropData),
                }}
                onClick={() => setModalIndex(index)}
              />
              {/* 底部白色裝飾條 */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[#c9a55a] text-sm font-serif tracking-widest select-none">
                  ✦
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 全螢幕 Modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="relative max-w-screen-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 拍立得大相框 */}
            <div
              className="bg-white mx-auto shadow-2xl"
              style={{
                border: '3px solid #c9a55a',
                padding: '32px 32px 84px 32px',
                maxWidth: '780px',
              }}
            >
              {/* Modal 顯示完整圖片，不套用裁切 */}
              <img
                src={photoUrls[modalIndex].url}
                alt={`宣傳照 ${modalIndex + 1}`}
                className="w-full object-cover"
                style={{
                  maxWidth: '716px',
                  maxHeight: '716px',
                }}
              />
              <div className="w-full flex items-end justify-center" style={{ height: '52px', paddingBottom: '6px' }}>
                <span className="text-[#c9a55a] text-xl font-serif font-bold tracking-[0.5em] select-none">
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
