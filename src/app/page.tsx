'use client'
import { useState } from 'react'
import { useChatMessages } from '@/lib/chatMessages'

export default function Page() {
  const [room, setRoom] = useState('general')
  const [content, setContent] = useState('')
  const [senderName, setSenderName] = useState('Victory')
  const [error, setError] = useState('')

  const { messages, loading, error: fetchError, reload } = useChatMessages(room, 200)

  async function send() {
    try {
      const r = await fetch('/api/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room, content, senderName }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'send failed')
      setContent('')
      reload() // refresh after send
    } catch (e: any) {
      setError(e.message || String(e))
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Somnia Streams Chat Demo</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="room"
        />
        <input
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="name"
        />
        <button onClick={reload} disabled={loading}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          style={{ flex: 1 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={send}>Send</button>
      </div>

      {(error || fetchError) && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>
          Error: {error || fetchError}
        </div>
      )}

      {loading ? (
        <p>Loading messages...</p>
      ) : !messages.length ? (
        <p>No messages yet.</p>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {messages.map((m, i) => (
            <li key={i}>
              <small>{new Date(m.timestamp).toLocaleTimeString()} </small>
              <b>{m.senderName || m.sender}</b>: {m.content}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
