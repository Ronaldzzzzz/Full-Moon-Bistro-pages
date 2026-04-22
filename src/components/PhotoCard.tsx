// src/components/PhotoCard.tsx
import { useState, useRef, useEffect } from 'react'
import type { PhotoUrl } from '../types'
import { getCropStyle } from '../utils/photoUtils'

interface Props {
  photoUrls: PhotoUrl[]
}

type Position = { x: number; y: number }

const rotations = ['rotate-[-2deg]', 'rotate-[2deg]', 'rotate-[-1.5deg]', 'rotate-[1.5deg]']

export default function PhotoCard({ photoUrls }: Props) {
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])

  // photoUrls 從 Firestore 非同步載入，需同步初始化 positions
  useEffect(() => {
    setPositions(current =>
      photoUrls.map((_, index) =>
        current[index] ?? {
          x: Math.random() * 10,
          y: 80 + index * 240 + Math.random() * 20,
        }
      )
    )
  }, [photoUrls.length])

  const dragState = useRef<{
    index: number
    startMouseX: number
    startMouseY: number
    startPosX: number
    startPosY: number
    moved: boolean
  } | null>(null)

  const mouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null)
  const mouseUpRef = useRef<(() => void) | null>(null)

  // Cleanup listeners on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) window.removeEventListener('mousemove', mouseMoveRef.current)
      if (mouseUpRef.current) window.removeEventListener('mouseup', mouseUpRef.current)
    }
  }, [])

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    dragState.current = {
      index,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: positions[index].x,
      startPosY: positions[index].y,
      moved: false,
    }

    mouseMoveRef.current = (ev: MouseEvent) => {
      if (!dragState.current) return
      const dx = ev.clientX - dragState.current.startMouseX
      const dy = ev.clientY - dragState.current.startMouseY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragState.current.moved = true
        setIsDragging(true)
      }
      const newX = Math.max(0, Math.min(20, dragState.current.startPosX + dx))
      const newY = Math.max(80, Math.min(window.innerHeight - 240, dragState.current.startPosY + dy))
      const idx = dragState.current.index
      setPositions(prev => {
        const next = [...prev]
        next[idx] = { x: newX, y: newY }
        return next
      })
    }

    mouseUpRef.current = () => {
      dragState.current = null
      setIsDragging(false)
      if (mouseMoveRef.current) window.removeEventListener('mousemove', mouseMoveRef.current)
      if (mouseUpRef.current) window.removeEventListener('mouseup', mouseUpRef.current)
      mouseMoveRef.current = null
      mouseUpRef.current = null
    }

    window.addEventListener('mousemove', mouseMoveRef.current)
    window.addEventListener('mouseup', mouseUpRef.current)
  }

  if (photoUrls.length === 0) return null

  return (
    <>
      {/* 拍立得相框 - 固定於左側，手機版隱藏，可自由拖動 */}
      <div
        className="hidden md:block"
        style={{ position: 'fixed', left: 0, top: 0, width: 220, height: '100vh', pointerEvents: 'none', zIndex: 40 }}
      >
        {photoUrls.slice(0, 3).map((entry, index) => (
          <div
            key={entry.url}
            className={rotations[index % rotations.length]}
            style={{
              position: 'absolute',
              left: positions[index]?.x ?? 0,
              top: positions[index]?.y ?? 80 + index * 240,
              width: 200,
              height: 220,
              pointerEvents: 'auto',
              userSelect: 'none',
            }}
          >
            {/* 拍立得相框外框：填滿外層 wrapper，border-box 讓尺寸精確對齊 */}
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
              {/* 照片本體：點擊開啟 Modal */}
              <img
                src={entry.url}
                alt={`宣傳照 ${index + 1}`}
                className="object-cover"
                draggable={false}
                style={{
                  width: '100%',
                  height: '172px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  ...getCropStyle(entry.cropData),
                }}
                onClick={() => setModalIndex(index)}
              />
              {/* 底部白色文字區：拖動把手 */}
              <div
                className="flex-1 flex items-center justify-center"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown(index)}
              >
                <span className="text-[#c9a55a] text-xs font-serif tracking-widest select-none">
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
            className="relative max-w-screen-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 拍立得大相框 */}
            <div
              className="bg-white mx-auto shadow-2xl"
              style={{
                border: '3px solid #c9a55a',
                padding: '24px 24px 60px 24px',
                maxWidth: '480px',
              }}
            >
              {/* Modal 顯示完整圖片，不套用裁切 */}
              <img
                src={photoUrls[modalIndex].url}
                alt={`宣傳照 ${modalIndex + 1}`}
                className="w-full object-cover"
                style={{
                  maxWidth: '432px',
                  maxHeight: '432px',
                }}
              />
              <div className="w-full flex items-center justify-center" style={{ height: '32px' }}>
                <span className="text-[#c9a55a] text-sm font-serif tracking-[0.5em] select-none">
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
