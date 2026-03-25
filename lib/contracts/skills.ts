// SkillsBay 合约地址配置

// 本地 Anvil 网络地址
const LOCAL_SKILL_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LOCAL_SKILL_MARKET_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Sepolia 测试网地址（部署后需要更新）
const SEPOLIA_SKILL_NFT_ADDRESS = "0x0000000000000000000000000000000000000000";
const SEPOLIA_SKILL_MARKET_ADDRESS = "0x0000000000000000000000000000000000000000";

// 从环境变量获取，如果没有则使用本地地址
export const SKILL_NFT_ADDRESS = (
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_SKILL_NFT_ADDRESS || LOCAL_SKILL_NFT_ADDRESS)
    : LOCAL_SKILL_NFT_ADDRESS
) as `0x${string}`;

export const SKILL_MARKET_ADDRESS = (
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_SKILL_MARKET_ADDRESS || LOCAL_SKILL_MARKET_ADDRESS)
    : LOCAL_SKILL_MARKET_ADDRESS
) as `0x${string}`;

// 调试信息
if (typeof window !== 'undefined') {
  console.log('🔧 Contract Configuration:', {
    SKILL_NFT_ADDRESS,
    SKILL_MARKET_ADDRESS,
    CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    ENV_NFT: process.env.NEXT_PUBLIC_SKILL_NFT_ADDRESS,
    ENV_MARKET: process.env.NEXT_PUBLIC_SKILL_MARKET_ADDRESS,
  });
}

// 配置参数
export const SKILLS_CONFIG = {
  protocolFeeBps: 500, // 5%
  minPurchaseAmount: "0.0001", // 最小购买金额（ETH）
};

// 技能 ID 映射（用于 Telegram Deep Link）
export const SKILL_IDS = {
  AI_IMAGE_GENERATION: 1,
  CODE_REVIEW_ASSISTANT: 2,
  LANGUAGE_TRANSLATION: 3,
} as const;

// 生成 Telegram Mini App Deep Link
export function generateSkillDeepLink(botUsername: string, skillId: number): string {
  return `https://t.me/${botUsername}/skillsbay?startapp=skill_${skillId}`;
}
