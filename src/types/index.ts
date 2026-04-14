import { Timestamp } from 'firebase/firestore'

export type MenuCategory = 'appetizer' | 'main' | 'dessert' | 'drink' | 'set'

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  appetizer: '開胃菜',
  main: '主食',
  dessert: '甜品',
  drink: '飲品',
  set: '套餐',
}

export const CATEGORY_ORDER: MenuCategory[] = ['appetizer', 'main', 'dessert', 'drink', 'set']

export interface MenuItem {
  id: string
  category: MenuCategory
  name: string
  description: string
  price: number
  imageUrl: string
  available: boolean
  order: number
}

export interface InventoryItem {
  id: string
  name: string
  stock: number
  unit: string
  note: string
}

export interface Reply {
  id: string
  authorId: string
  serverName: string
  isAnonymous: boolean
  content: string
  timestamp: Timestamp
}

export interface Message {
  id: string
  authorId: string
  serverName: string
  isAnonymous: boolean
  content: string
  timestamp: Timestamp
  likes: number
  dislikes: number
  replies?: Reply[]
}

export interface AdminSession {
  role: 'owner' | 'staff'
  label: string
}
