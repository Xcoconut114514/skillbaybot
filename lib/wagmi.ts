// lib/wagmi.ts
import { http, createConfig } from "wagmi";
import { bscTestnet } from "wagmi/chains";

// 硬编码 RPC
const RPC_URL = "https://data-seed-prebsc-2-s1.binance.org:8545";

export const config = createConfig({
    chains: [bscTestnet],
    transports: {
        [bscTestnet.id]: http(RPC_URL),
    },
});
