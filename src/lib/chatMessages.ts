'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { SDK } from '@somnia-chain/streams'
import { getPublicHttpClient } from './clients'
import { chatSchema } from './chatSchema'
import { toHex, type Hex } from 'viem'

// Helper to unwrap field values
const val = (f: any) => f?.value?.value ?? f?.value

// Message type
export type ChatMsg = {
  timestamp: number
  roomId: `0x${string}`
  content: string
  senderName: string
  sender: `0x${string}`
}

/**
 * Fetch chat messages from Somnia Streams (read-only, auto-refresh, cumulative)
 */
export function useChatMessages(
  roomName?: string,
  limit = 100,
  refreshMs = 5000
) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const loadMessages = useCallback(async () => {
    try {
      const sdk = new SDK({ public: getPublicHttpClient() })

      // Compute schema ID from the chat schema
      const schemaId = await sdk.streams.computeSchemaId(chatSchema)
      const publisher =
        process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS ??
        '0x0000000000000000000000000000000000000000'

      // Fetch all publisher data for schema
      const resp = await sdk.streams.getAllPublisherDataForSchema(schemaId, publisher)

      // Ensure array structure (each row corresponds to an array of fields)
      const rows: any[][] = Array.isArray(resp) ? (resp as any[][]) : []
      if (!rows.length) {
        setMessages([])
        setLoading(false)
        return
      }

      // Convert room name to bytes32 for filtering (if applicable)
      const want = roomName ? toHex(roomName, { size: 32 }).toLowerCase() : null

      const parsed: ChatMsg[] = []
      for (const row of rows) {
        if (!Array.isArray(row) || row.length < 5) continue

        const ts = Number(val(row[0]))
        const ms = String(ts).length <= 10 ? ts * 1000 : ts // handle seconds vs ms
        const rid = String(val(row[1])) as `0x${string}`

        // Skip messages from other rooms if filtered
        if (want && rid.toLowerCase() !== want) continue

        parsed.push({
          timestamp: ms,
          roomId: rid,
          content: String(val(row[2]) ?? ''),
          senderName: String(val(row[3]) ?? ''),
          sender: (String(val(row[4])) as `0x${string}`) ??
            '0x0000000000000000000000000000000000000000',
        })
      }

      // Sort by timestamp (ascending)
      parsed.sort((a, b) => a.timestamp - b.timestamp)

      // Deduplicate and limit
      setMessages((prev) => {
        const combined = [...prev, ...parsed]
        const unique = combined.filter(
          (msg, index, self) =>
            index ===
            self.findIndex(
              (m) =>
                m.timestamp === msg.timestamp &&
                m.sender === msg.sender &&
                m.content === msg.content
            )
        )
        return unique.slice(-limit)
      })

      setError(null)
    } catch (err: any) {
      console.error('❌ Failed to load chat messages:', err)
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [roomName, limit])

  // Initial load + polling
  useEffect(() => {
    setLoading(true)
    loadMessages()
    timerRef.current = setInterval(loadMessages, refreshMs)
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [loadMessages, refreshMs])

  return { messages, loading, error, reload: loadMessages }
}
