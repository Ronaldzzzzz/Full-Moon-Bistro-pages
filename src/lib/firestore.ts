import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  increment,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { MenuItem, InventoryItem, Message, Reply, LiveMusicConfig, NoticeConfig } from '../types'

// ─── Menu Items ────────────────────────────────────────────────

export async function getMenuItems(): Promise<MenuItem[]> {
  const q = query(collection(db, 'menuItems'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem))
}

export async function addMenuItem(
  data: Omit<MenuItem, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'menuItems'), data)
  if (data.ingredients && data.ingredients.length > 0) {
    await syncInventoryFromIngredients(data.name, data.ingredients)
  }
  return ref.id
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, 'menuItems', id), data)
  if (data.ingredients && data.ingredients.length > 0) {
    // 獲取目前的名稱，如果 data 沒給就從既有資料抓 (這裡簡化為如果有傳 name 就用新的)
    const name = data.name || (await getMenuItems()).find(i => i.id === id)?.name || '未知品項'
    await syncInventoryFromIngredients(name, data.ingredients)
  }
}

async function syncInventoryFromIngredients(itemName: string, ingredients: MenuItem['ingredients']): Promise<void> {
  if (!ingredients || ingredients.length === 0) return
  const inventoryItems = await getInventoryItems()
  const batch = writeBatch(db)
  let hasOps = false
  const processedIds = new Set<number>() // 追蹤此批次已處理的 ID

  // 1. 載入 master_items.json 獲取真實資訊
  let masterItems: Record<string, { n: string; i: string }> = {}
  try {
    const res = await fetch('/Full-Moon-Bistro-pages/data/master_items.json')
    if (res.ok) {
      masterItems = await res.json()
    }
  } catch (error) {
    console.error('Failed to load master_items.json in sync logic:', error)
  }

  for (const ing of ingredients) {
    if (processedIds.has(ing.id)) continue
    processedIds.add(ing.id)

    // 比對既存食材 (透過 recipeIngredientId 或舊有名稱)
    const existingItem = inventoryItems.find(
      (item) => item.recipeIngredientId === ing.id || item.name === `食材 #${ing.id}`
    )

    const masterData = masterItems[ing.id.toString()]
    const realName = masterData ? masterData.n : `食材 #${ing.id}`
    const iconPath = masterData ? masterData.i : undefined

    if (!existingItem) {
      // 若不存在則建立
      const newRef = doc(collection(db, 'inventory'))
      const newItemData: any = {
        name: realName,
        stock: 0,
        note: `${itemName}`,
        recipeIngredientId: ing.id,
      }
      if (iconPath) newItemData.icon = iconPath

      batch.set(newRef, newItemData)
      hasOps = true
      } else {
      // 若已存在但資訊不全，則更新。備註若原本是自動匯入的也可以更新。
      const updates: any = {}
      let needsUpdate = false

      if (existingItem.name === `食材 #${ing.id}` && masterData) {
        updates.name = realName
        needsUpdate = true
      }
      if (!existingItem.icon && iconPath) {
        updates.icon = iconPath
        needsUpdate = true
      }
      if (existingItem.recipeIngredientId !== ing.id) {
        updates.recipeIngredientId = ing.id
        needsUpdate = true
      }

      // 更新備註，僅保留品項名稱
      if (!existingItem.note || existingItem.note.includes('需求')) {
        updates.note = `${itemName}`
        needsUpdate = true
      }

      if (needsUpdate) {
        batch.update(doc(db, 'inventory', existingItem.id), updates)
        hasOps = true
      }
    }
  }

  if (hasOps) {
    await batch.commit()
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'menuItems', id))
}

// ─── Inventory ─────────────────────────────────────────────────

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const snap = await getDocs(collection(db, 'inventory'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryItem))
}

export async function addInventoryItem(
  data: Omit<InventoryItem, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'inventory'), data)
  return ref.id
}

export async function updateInventoryItem(
  id: string,
  data: Partial<Omit<InventoryItem, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, 'inventory', id), data)
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'inventory', id))
}

export async function deleteInventoryItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const batch = writeBatch(db)
  ids.forEach(id => {
    batch.delete(doc(db, 'inventory', id))
  })
  await batch.commit()
}

// ─── Messages ──────────────────────────────────────────────────

export async function getMessages(): Promise<Message[]> {
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'))
  const snap = await getDocs(q)

  const messages = await Promise.all(
    snap.docs.map(async (d) => {
      const repliesSnap = await getDocs(
        query(collection(db, 'messages', d.id, 'replies'), orderBy('timestamp'))
      )
      const replies: Reply[] = repliesSnap.docs.map(
        (r) => ({ id: r.id, ...r.data() } as Reply)
      )
      return { id: d.id, ...d.data(), replies } as Message
    })
  )

  return messages
}

export async function addMessage(data: {
  authorId: string
  serverName: string
  isAnonymous: boolean
  content: string
}): Promise<string> {
  const ref = await addDoc(collection(db, 'messages'), {
    ...data,
    timestamp: serverTimestamp(),
    likes: 0,
    dislikes: 0,
  })
  return ref.id
}

export async function addReply(
  messageId: string,
  data: {
    authorId: string
    serverName: string
    isAnonymous: boolean
    content: string
  }
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'messages', messageId, 'replies'),
    { ...data, timestamp: serverTimestamp() }
  )
  return ref.id
}

export async function likeMessage(
  messageId: string,
  type: 'likes' | 'dislikes'
): Promise<void> {
  await updateDoc(doc(db, 'messages', messageId), {
    [type]: increment(1),
  })
}

export async function deleteMessage(messageId: string): Promise<void> {
  // 先刪除子集合 replies，再刪除主文件
  const repliesSnap = await getDocs(
    collection(db, 'messages', messageId, 'replies')
  )
  const batch = writeBatch(db)
  repliesSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, 'messages', messageId))
  await batch.commit()
}

export async function deleteReply(
  messageId: string,
  replyId: string
): Promise<void> {
  await deleteDoc(doc(db, 'messages', messageId, 'replies', replyId))
}

// ─── Admin Management ──────────────────────────────────────────

export async function getAdmins(): Promise<{ id: string; role: string; label: string }[]> {
  const snap = await getDocs(collection(db, 'adminPasswords'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; role: string; label: string }))
}

export async function addAdmin(hash: string, role: 'owner' | 'staff', label: string): Promise<void> {
  await setDoc(doc(db, 'adminPasswords', hash), { role, label })
}

export async function deleteAdmin(hash: string): Promise<void> {
  await deleteDoc(doc(db, 'adminPasswords', hash))
}

// ─── Live Music ────────────────────────────────────────────────

export async function getLiveMusicConfig(): Promise<LiveMusicConfig | null> {
  const docSnap = await getDoc(doc(db, 'config', 'liveMusic'))
  if (!docSnap.exists()) return null
  return docSnap.data() as LiveMusicConfig
}

export async function updateLiveMusicConfig(data: Partial<LiveMusicConfig>): Promise<void> {
  await setDoc(doc(db, 'config', 'liveMusic'), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

// ─── Notices ───────────────────────────────────────────────────

export async function getNotices(): Promise<NoticeConfig[]> {
  const q = query(collection(db, 'notices'), orderBy('updatedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NoticeConfig))
}

export async function updateNotice(id: string, data: Partial<Omit<NoticeConfig, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'notices', id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function addNotice(data: Omit<NoticeConfig, 'id' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'notices'), {
    ...data,
    updatedAt: serverTimestamp()
  })
  return ref.id
}

export async function deleteNotice(id: string): Promise<void> {
  await deleteDoc(doc(db, 'notices', id))
}
