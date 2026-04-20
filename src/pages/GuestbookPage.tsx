import { useEffect, useState, useCallback } from 'react'
import type { Message } from '../types'
import { getMessages } from '../lib/firestore'
import MessageCard from '../components/guestbook/MessageCard'
import MessageForm from '../components/guestbook/MessageForm'

export default function GuestbookPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    getMessages()
      .then(setMessages)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-serif text-[var(--color-gold-primary)] text-lg tracking-widest">✦ 留言板 ✦</h2>
        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[var(--color-border-gold)] to-transparent" />
      </div>

      <MessageForm onSubmitted={load} />

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-[#9a8a70] text-sm text-center py-8">載入中…</p>
        ) : messages.length === 0 ? (
          <p className="text-[#9a8a70] text-sm text-center py-8">尚無留言，歡迎第一個留言！</p>
        ) : (
          messages.map((msg) => <MessageCard key={msg.id} message={msg} />)
        )}
      </div>
    </div>
  )
}
