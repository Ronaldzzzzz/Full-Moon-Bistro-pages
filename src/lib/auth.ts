import {
  signInAnonymously,
  signOut as firebaseSignOut,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import {
  doc,
  getDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { AdminSession } from '../types'

const SESSION_KEY = 'adminSession'

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function signInWithPassword(password: string): Promise<AdminSession> {
  const hash = await hashPassword(password)
  const docRef = doc(db, 'adminPasswords', hash)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    throw new Error('密碼錯誤')
  }

  const { role, label } = docSnap.data() as { role: 'owner' | 'staff'; label: string }

  await setPersistence(auth, browserSessionPersistence)
  await signInAnonymously(auth)

  const session: AdminSession = { role, label }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function signOutAdmin(): Promise<void> {
  await firebaseSignOut(auth)
  clearAdminSession()
}

export function getAdminSession(): AdminSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}
