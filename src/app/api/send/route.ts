import { NextResponse } from 'next/server'
import { sendMessage } from '@/lib/chatService'

export async function POST(req: Request) {
  try {
    const { room, content, senderName } = await req.json()
    if (!room || !content) throw new Error('Missing fields')
    const { txHash } = await sendMessage(room, content, senderName)
    return NextResponse.json({ success: true, txHash })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Failed to send' }, { status: 500 })
  }
}
