# SkillsBay - Telegram 技能市场

基于 Telegram Bot + Mini App 的去中心化技能购买和激活平台。

## 🎯 核心功能

### 四步购买流程

1. **技能发现 (Discovery)** - 在 Telegram Bot 中浏览技能列表
2. **参数化跳转 (Deep Linking)** - 通过 `startapp` 参数跳转到指定技能
3. **无缝支付 (Seamless Payment)** - 在 Mini App 内完成以太坊支付
4. **能力激活 (Activation)** - 支付成功后 Bot 推送激活通知

## 🚀 快速开始

### 1. 部署智能合约

```bash
cd SkillsBay_contract
forge install OpenZeppelin/openzeppelin-contracts
cp .env.example .env
# 编辑 .env 填入配置

# 部署到 Sepolia
./deploy-sepolia.sh
```

### 2. 配置前端

编辑 `lib/contracts/skills.ts`：

```typescript
export const SKILL_NFT_ADDRESS = "0x你的地址";
export const SKILL_MARKET_ADDRESS = "0x你的地址";
```

### 3. 启动开发

```bash
pnpm install
pnpm dev
```

访问 http://localhost:3000

## 📱 Telegram 集成

### 创建 Bot

1. 找到 @BotFather
2. `/newbot` 创建 Bot
3. 记录 Token

### 配置 WebApp

```python
# bot.py
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

keyboard = [
    [InlineKeyboardButton(
        "🎨 AI Image Generation",
        web_app={"url": "https://your-app.com?startapp=skill_1"}
    )],
]
```

## 🏗️ 技术架构

### 智能合约（Sepolia）

- **SkillNFT.sol** - 技能 NFT 管理
- **SkillMarket.sol** - 支付和激活逻辑

### 前端（Next.js 14）

- **Wagmi v2** - 以太坊钱包连接
- **HeroUI** - UI 组件库
- **Telegram WebApp SDK** - Telegram 集成

### 后端（可选）

- 监听链上购买事件
- 自动激活技能
- 发送 Telegram 通知

## 📚 文档

- [快速开始](./QUICKSTART.md)
- [Telegram 集成指南](./INTEGRATION_GUIDE.md)
- [合约部署指南](../SkillsBay_contract/DEPLOYMENT_GUIDE.md)

## 🧪 测试网信息

- **网络**: Sepolia Testnet
- **Chain ID**: 11155111
- **获取测试币**: https://sepoliafaucet.com/

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 部署到 Vercel
vercel --prod
```

## 📦 项目结构

```
SkillsBay/
├── app/
│   └── (with-nav)/
│       └── skills/          # 技能市场页面
├── components/              # React 组件
├── lib/
│   ├── abi/                # 合约 ABI
│   └── contracts/          # 合约地址配置
├── types/                  # TypeScript 类型
└── config/                 # 应用配置

SkillsBay_contract/
├── src/
│   ├── SkillNFT.sol       # 技能 NFT 合约
│   └── SkillMarket.sol    # 市场合约
├── script/                # 部署脚本
└── test/                  # 测试文件
```

## 🌟 特性

- ✅ 基于 ERC721 的技能 NFT
- ✅ Telegram 用户 ID 与以太坊地址关联
- ✅ 5% 协议费自动收取
- ✅ 支持批量查询和管理
- ✅ 完整的购买和激活流程
- ✅ 响应式设计，支持移动端

## 🔐 安全

- 使用 OpenZeppelin 标准合约
- ReentrancyGuard 防重入攻击
- Ownable 权限管理
- 合约已在 Sepolia 测试

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

- GitHub: [SkillsBay](https://github.com/skillsbay)
- Telegram: @skillsbay_bot
