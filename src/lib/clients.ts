// src/lib/clients.ts
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { somniaTestnet } from './chain'

// const need = (k: 'RPC_URL' | 'PRIVATE_KEY') => {
//   const v = process.env[k]
//   if (!v) throw new Error(`Missing ${k} in .env.local`)
//   return v
// }

let _pub: ReturnType<typeof createPublicClient> | null = null
export function getPublicHttpClient() {
  if (_pub) return _pub
  _pub = createPublicClient({ chain: somniaTestnet, transport: http("https://dream-rpc.somnia.network/") })
  return _pub
}

let _wallet: ReturnType<typeof createWalletClient> | null = null
export function getWalletClient() {
  if (_wallet) return _wallet
  _wallet = createWalletClient({
    account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
    chain: somniaTestnet,
    transport: http('https://dream-rpc.somnia.network/'),
  })
  return _wallet
}

export const publisherAddress = () => getWalletClient().account!.address
