import { createPublicClient, createWalletClient, http } from 'viem'
import { somniaTestnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network'
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`

export function getPublicHttpClient() {
  return createPublicClient({
    chain: somniaTestnet,
    transport: http(RPC_URL),
  })
}

export function getWalletClient() {
  if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY in .env.local')
  return createWalletClient({
    chain: somniaTestnet,
    transport: http(RPC_URL),
    account: privateKeyToAccount(PRIVATE_KEY),
  })
}
