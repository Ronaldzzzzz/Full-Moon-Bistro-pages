import { useEffect, useState } from 'react'
import { getMoonPhase } from '../lib/moon'

export default function MoonPhaseBackground() {
  const [phase, setPhase] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setPhase(getMoonPhase() % 1)
    
    // 检测屏幕宽度，lg 断点是 1024px
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 核心數學邏輯：
  // 我們使用一個白色的圓作為亮面，並透過遮罩來顯示它。
  // 遮罩由兩個部分組成：一個半圓和一個橢圓。
  const isFirstHalf = phase <= 0.5
  // rx 在 0 和 0.5 時為 50 (橢圓變圓)，在 0.25 時為 0 (橢圓變線)
  const rx = Math.abs(50 - (phase % 0.5) * 200)
  
  // 決定橢圓是「增加亮區」還是「增加暗區」
  // phase 0.00-0.25: 橢圓是黑的 (遮掉半圓的一部分) -> 眉月
  // phase 0.25-0.50: 橢圓是白的 (增加到半圓上) -> 盈凸月
  // phase 0.50-0.75: 橢圓是白的 (增加到半圓上) -> 虧凸月
  // phase 0.75-1.00: 橢圓是黑的 (遮掉半圓的一部分) -> 殘月
  const ellipseColor = (phase > 0.25 && phase <= 0.75) ? "white" : "black"

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] select-none overflow-hidden">
      <div 
        className={isMobile ? "absolute top-[-10%] left-1/2 w-[600px] h-[600px]" : "absolute top-[-15%] right-[-50px] w-[1000px] h-[1000px]"}
        style={{ 
          transform: isMobile ? 'translateX(-50%) rotate(50deg)' : 'rotate(50deg)',
        }}
      >
        {/* 加大畫布到 200x200，中心點在 50,50，以保持月亮大小穩定並預留光暈空間 */}
        <svg viewBox="-50 -50 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="moonGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff5bc" />
              <stop offset="70%" stopColor="#f4e38e" />
              <stop offset="100%" stopColor="#d4af7a" />
            </radialGradient>

            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(244, 227, 142, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <mask id="moonMask">
              {/* 預設全黑 (隱藏) */}
              <rect x="0" y="0" width="100" height="100" fill="black" />
              {/* 基礎半圓 (盈月亮右半，虧月亮左半) */}
              <path 
                d={isFirstHalf ? "M 50 0 A 50 50 0 0 1 50 100 Z" : "M 50 0 A 50 50 0 0 0 50 100 Z"} 
                fill="white" 
              />
              {/* 動態橢圓 (根據進度加亮或變暗) */}
              <ellipse cx="50" cy="50" rx={rx} ry="50" fill={ellipseColor} />
            </mask>
          </defs>

          {/* 底層光暈 - 固定大小 */}
          <circle cx="50" cy="50" r="70" fill="url(#glowGradient)" className="animate-moon-pulse" />

          {/* 月球本體 (亮面) - 套用遮罩 */}
          <circle cx="50" cy="50" r="48" fill="url(#moonGradient)" mask="url(#moonMask)" className="animate-moon-pulse" />
        </svg>
      </div>
    </div>
  )
}
