import { SDK, SchemaEncoder, zeroBytes32 } from '@somnia-chain/streams'
import { getPublicHttpClient, getWalletClient } from './clients'
import { waitForTransactionReceipt } from 'viem/actions'
import { toHex, type Hex } from 'viem'
import { chatSchema } from './chatSchema'

const encoder = new SchemaEncoder(chatSchema)

export async function sendMessage(room: string, content: string, senderName: string) {
  const sdk = new SDK({
    public: getPublicHttpClient(),
    wallet: getWalletClient(),
  })

  // Compute or register schema
  const schemaId = await sdk.streams.computeSchemaId(chatSchema)
  const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId)
  if (!isRegistered) {
    const ignoreAlreadyRegistered = true
    const txHash = await sdk.streams.registerDataSchemas(
      [{ id: 'chat', schema: chatSchema, parentSchemaId: zeroBytes32 }],
      ignoreAlreadyRegistered
    )
    if (!txHash) throw new Error('Failed to register schema')
    await waitForTransactionReceipt(getPublicHttpClient(), { hash: txHash })
  }

  const now = Date.now().toString()
  const roomId = toHex(room, { size: 32 })
  const data: Hex = encoder.encodeData([
    { name: 'timestamp', value: now, type: 'uint64' },
    { name: 'roomId', value: roomId, type: 'bytes32' },
    { name: 'content', value: content, type: 'string' },
    { name: 'senderName', value: senderName, type: 'string' },
    { name: 'sender', value: getWalletClient().account.address, type: 'address' },
  ])

  const dataId = toHex(`${room}-${now}`, { size: 32 })
  const tx = await sdk.streams.set([{ id: dataId, schemaId, data }])
  if (!tx) throw new Error('Failed to publish chat message')
  await waitForTransactionReceipt(getPublicHttpClient(), { hash: tx })
  return { txHash: tx }
}
