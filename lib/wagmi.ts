import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10_143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
      webSocket: ["wss://testnet-rpc.monad.xyz/ws"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
      webSocket: ["wss://testnet-rpc.monad.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadVision Testnet",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const monad = monadTestnet;

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
  ssr: true,
});
