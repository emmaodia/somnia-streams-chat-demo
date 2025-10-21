// src/lib/chatEvents.ts
import { SDK } from '@somnia-chain/streams'
import { getPublicHttpClient, getWalletClient } from './clients'

export const CHAT_EVENT_ID = 'ChatMessage'
export const CHAT_EVENT_SIG = 'ChatMessage(bytes32 indexed roomId)'

export async function ensureChatEventSchema() {
  const sdk = new SDK({ public: getPublicHttpClient(), wallet: getWalletClient() })
  try {
    const existing = await sdk.streams.getEventSchemasById([CHAT_EVENT_ID])
    if (existing && existing.length > 0) return
  } catch { /* proceed to register */ }

  const tx = await sdk.streams.registerEventSchemas(
    [CHAT_EVENT_ID],
    [{
      params: [{ name: 'roomId', paramType: 'bytes32', isIndexed: true }],
      eventTopic: CHAT_EVENT_SIG,
    }]
  )
  if (!tx) throw new Error('Failed to register ChatMessage event schema')
}
