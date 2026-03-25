# SkillsBay 快速开始

## 🚀 5 分钟快速部署

### 1. 部署智能合约（2 分钟）

```bash
# 进入合约目录
cd SkillsBay_contract

# 安装依赖
forge install OpenZeppelin/openzeppelin-contracts

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的私钥和 RPC URL

# 部署到 Sepolia
./deploy-sepolia.sh  # Linux/Mac
# 或
deploy-sepolia.bat   # Windows
```

**记录输出的合约地址！**

### 2. 配置前端（1 分钟）

编辑 `SkillsBay/lib/contracts/skills.ts`：

```typescript
export const SKILL_NFT_ADDRESS = "0x你的SkillNFT地址" as `0x${string}`;
export const SKILL_MARKET_ADDRESS = "0x你的SkillMarket地址" as `0x${string}`;
```

### 3. 启动前端（1 分钟）

```bash
cd SkillsBay
pnpm install
pnpm dev
```

访问 http://localhost:3000

### 4. 测试购买（1 分钟）

1. 连接 MetaMask（切换到 Sepolia 测试网）
2. 访问 `/skills` 页面
3. 点击 "Purchase Skill"
4. 确认交易

完成！🎉

## 📱 Telegram 集成（可选）

### 创建 Telegram Bot

1. 在 Telegram 中找到 @BotFather
2. 发送 `/newbot` 创建新 Bot
3. 记录 Bot Token

### 配置 WebApp

```bash
# 部署前端到 Vercel
cd SkillsBay
vercel --prod

# 在 BotFather 中设置 WebApp
/setmenubutton
# 输入你的 Vercel URL
```

### 添加技能列表命令

创建 `bot.py`：

```python
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler

async def skills(update: Update, context):
    keyboard = [
        [InlineKeyboardButton(
            "🎨 AI Image Generation",
            web_app={"url": "https://your-app.vercel.app?startapp=skill_1"}
        )],
    ]
    await update.message.reply_text(
        "Choose a skill:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

app = Application.builder().token("YOUR_BOT_TOKEN").build()
app.add_handler(CommandHandler("skills", skills))
app.run_polling()
```

运行：

```bash
python bot.py
```

## 🧪 测试清单

- [ ] 合约部署成功
- [ ] 前端可以连接钱包
- [ ] 可以查看技能列表
- [ ] 可以购买技能
- [ ] 购买后显示在 "My Skills"
- [ ] Telegram Bot 可以打开 WebApp
- [ ] Deep Link 参数正确传递

## 📚 详细文档

- [合约部署指南](../SkillsBay_contract/DEPLOYMENT_GUIDE.md)
- [Telegram 集成指南](./INTEGRATION_GUIDE.md)
- [合约说明](../SkillsBay_contract/README.md)

## ❓ 常见问题

**Q: 找不到 forge 命令**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Q: 没有测试 ETH**
访问：https://sepoliafaucet.com/

**Q: MetaMask 连接失败**
确保切换到 Sepolia 测试网（Chain ID: 11155111）

**Q: 交易失败**
检查钱包是否有足够的 ETH 支付 gas 费

## 🎯 下一步

1. 自定义技能信息
2. 添加更多技能
3. 集成后端监听服务
4. 部署到生产环境

需要帮助？查看详细文档或提交 Issue。
