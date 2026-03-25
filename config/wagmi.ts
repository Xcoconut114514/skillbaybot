import { http, createConfig } from 'wagmi';
import { sepolia, bscTestnet, localhost } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// 自定义本地链配置，确保与 Anvil 兼容
const anvilLocal = {
  ...localhost,
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
} as const;

// 硬编码 RPC / WalletConnect 项目 ID（按要求写死在代码中）
const RPC_URL = 'https://data-seed-prebsc-2-s1.binance.org:8545';
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/726930ebd0e248ff94a8da1ce85ee33a';
const WALLETCONNECT_PROJECT_ID = '3d0b389d5e9da1836f8f5067bc123231'; // 目前未启用 walletConnect 连接器

// 仅使用 injected（MetaMask/OKX），如需 WalletConnect 可在此处扩展
const connectors = [
  injected({
    shimDisconnect: true,
  }),
];

// 支持 Sepolia 测试网、本地开发和 BSC 测试网
export const wagmiConfig = createConfig({
  chains: [anvilLocal, sepolia, bscTestnet],
  connectors,
  transports: {
    [anvilLocal.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(SEPOLIA_RPC_URL),
    [bscTestnet.id]: http(RPC_URL),
  },
  ssr: true,
});
