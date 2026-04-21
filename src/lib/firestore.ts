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
    await syncInventoryFromIngredients(data.ingredients)
  }
  return ref.id
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, 'menuItems', id), data)
  if (data.ingredients && data.ingredients.length > 0) {
    await syncInventoryFromIngredients(data.ingredients)
  }
}

async function syncInventoryFromIngredients(ingredients: MenuItem['ingredients']): Promise<void> {
  if (!ingredients) return
  const inventoryItems = await getInventoryItems()
  const batch = writeBatch(db)
  let hasOps = false

  for (const ing of ingredients) {
    const exists = inventoryItems.some(
      (item) => item.recipeIngredientId === ing.id || item.name === `食材 #${ing.id}`
    )
    if (!exists) {
      const newRef = doc(collection(db, 'inventory'))
      batch.set(newRef, {
        name: `食材 #${ing.id}`,
        stock: 0,
        unit: '份',
        note: '自動匯入建立',
        recipeIngredientId: ing.id,
      })
      hasOps = true
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

// ─── Messages ──────────────────────────────────────────────────

export async function getMessages(): Promise<Message[]> {
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'))
  const snap = await getDocs(q)
  const messages: Message[] = []

  for (const d of snap.docs) {
    const repliesSnap = await getDocs(
      query(collection(db, 'messages', d.id, 'replies'), orderBy('timestamp'))
    )
    const replies: Reply[] = repliesSnap.docs.map(
      (r) => ({ id: r.id, ...r.data() } as Reply)
    )
    messages.push({ id: d.id, ...d.data(), replies } as Message)
  }

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
