import type { CSSProperties } from 'react'
import type { PhotoUrl, CropData } from '../types'

export function getUrl(entry: string | PhotoUrl): string {
  return typeof entry === 'string' ? entry : entry.url
}

// 供 Tasks 3-6 使用的裁切樣式工具
export function getCropStyle(cropData?: CropData): CSSProperties {
  if (!cropData) return {}
  return {
    objectFit: 'cover',
    objectPosition: `${cropData.x}% ${cropData.y}%`,
  }
}
