'use client'
import { useState } from 'react'
import { useChatMessages } from '@/lib/chatMessages'

export default function Page() {
  const [room, setRoom] = useState('general')
  const [content, setContent] = useState('')
  const [senderName, setSenderName] = useState('Victory')
  const [error, setError] = useState<string | null>(null)

  const {
    messages,
    loading,
    error: fetchError,
    reload,
  } = useChatMessages(room, 200)

  // --- Send new message via API route ---
  async function send() {
    try {
      if (!content.trim()) {
        setError('Message content cannot be empty')
        return
      }

      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room, content, senderName }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to send message')

      setContent('')
      setError(null)
      reload() // refresh after sending
    } catch (e: any) {
      console.error('❌ Send message failed:', e)
      setError(e?.message || 'Failed to send message')
    }
  }

  // --- Render UI ---
  return (
    <main
      style={{
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <h1>💬 Somnia Data Streams Chat</h1>
      <p style={{ color: '#666' }}>
        Messages are stored <b>onchain</b> and read using Somnia Data Streams.
      </p>

      {/* Room + Name inputs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="room name"
          style={{ flex: 1, padding: 6 }}
        />
        <input
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="your name"
          style={{ flex: 1, padding: 6 }}
        />
        <button
          onClick={reload}
          disabled={loading}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          Refresh
        </button>
      </div>

      {/* Message input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          style={{ flex: 1, padding: 6 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={send}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          Send
        </button>
      </div>

      {/* Error messages */}
      {(error || fetchError) && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>
          Error: {error || fetchError}
        </div>
      )}

      {/* Message list */}
      {loading ? (
        <p>Loading messages...</p>
      ) : !messages.length ? (
        <p>No messages yet.</p>
      ) : (
        <ul style={{ paddingLeft: 16, listStyle: 'none' }}>
          {messages.map((m, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <small style={{ color: '#666' }}>
                {new Date(m.timestamp).toLocaleTimeString()}
              </small>{' '}
              <b>{m.senderName || m.sender}</b>: {m.content}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
