import { createConfig, http } from 'wagmi'

export const monad = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'MonadVision Testnet', url: 'https://testnet.monadvision.com' },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [monad],
  transports: {
    [monad.id]: http(),
  },
  ssr: true,
})
