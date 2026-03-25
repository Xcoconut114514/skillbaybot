# SkillsBay Telegram 集成指南

## 完整流程说明

### Step 1: 技能发现 (Discovery)

用户在 Telegram Bot 中看到技能列表。

**Bot 代码示例（Python）：**

```python
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

async def skills_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """显示技能列表"""
    keyboard = [
        [InlineKeyboardButton(
            "🎨 AI Image Generation - 0.001 ETH",
            web_app={"url": "https://your-domain.com?startapp=skill_1"}
        )],
        [InlineKeyboardButton(
            "💻 Code Review Assistant - 0.002 ETH",
            web_app={"url": "https://your-domain.com?startapp=skill_2"}
        )],
        [InlineKeyboardButton(
            "🌐 Language Translation - 0.0015 ETH",
            web_app={"url": "https://your-domain.com?startapp=skill_3"}
        )],
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "🛍️ Choose a skill to purchase:",
        reply_markup=reply_markup
    )

# 注册命令
app = Application.builder().token("YOUR_BOT_TOKEN").build()
app.add_handler(CommandHandler("skills", skills_command))
```

### Step 2: 参数化跳转 (Deep Linking)

用户点击按钮后，Mini App 接收 `startapp` 参数。

**前端代码（已实现）：**

```typescript
// SkillsBay/app/(with-nav)/skills/page.tsx
useEffect(() => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    tg.ready();
    
    // 获取 Telegram 用户信息
    const user = tg.initDataUnsafe?.user;
    if (user?.id) {
      setTelegramUserId(user.id.toString());
    }
    
    // 从 startapp 参数获取技能 ID
    const startParam = tg.initDataUnsafe?.start_param;
    if (startParam && startParam.startsWith('skill_')) {
      const skillId = parseInt(startParam.replace('skill_', ''));
      // 自动打开购买弹窗
      handleOpenPurchase(skillId, price);
    }
  }
}, []);
```

### Step 3: 无缝支付 (Seamless Payment)

用户在 Mini App 内完成支付（使用 MetaMask 或其他钱包）。

**支付流程：**

1. 用户点击 "Purchase Skill"
2. 连接以太坊钱包（MetaMask）
3. 确认交易（支付 ETH）
4. 智能合约记录购买信息
5. 关联 Telegram ID 和以太坊地址

**智能合约调用：**

```typescript
// 创建购买记录
createPurchase({
  address: SKILL_MARKET_ADDRESS,
  abi: SkillMarketABI,
  functionName: 'createPurchase',
  args: [BigInt(skillId), telegramUserId],
  value: price, // 支付金额
});
```

### Step 4: 能力激活 (Activation)

支付成功后，Bot 后端监听链上事件并激活技能。

**后端监听代码（Python + Web3）：**

```python
from web3 import Web3
from telegram import Bot
import asyncio

# 连接到 Sepolia
w3 = Web3(Web3.HTTPProvider('https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY'))

# 合约配置
SKILL_MARKET_ADDRESS = '0x你的SkillMarket地址'
SKILL_MARKET_ABI = [...] # 从 SkillMarket.json 复制

contract = w3.eth.contract(address=SKILL_MARKET_ADDRESS, abi=SKILL_MARKET_ABI)
bot = Bot(token='YOUR_BOT_TOKEN')

async def monitor_purchases():
    """监听购买事件"""
    last_checked_id = 1
    
    while True:
        try:
            # 获取待激活的购买记录
            pending = contract.functions.getPendingPurchases(
                last_checked_id, 
                10
            ).call()
            
            for purchase_id in pending:
                # 获取购买详情
                purchase = contract.functions.getPurchase(purchase_id).call()
                buyer, skill_id, amount, timestamp, is_activated, telegram_user_id = purchase
                
                if not is_activated:
                    # 激活购买（需要管理员私钥）
                    tx = contract.functions.activatePurchase(purchase_id).build_transaction({
                        'from': ADMIN_ADDRESS,
                        'nonce': w3.eth.get_transaction_count(ADMIN_ADDRESS),
                    })
                    signed_tx = w3.eth.account.sign_transaction(tx, ADMIN_PRIVATE_KEY)
                    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                    
                    # 等待交易确认
                    w3.eth.wait_for_transaction_receipt(tx_hash)
                    
                    # 发送 Telegram 通知
                    await bot.send_message(
                        chat_id=telegram_user_id,
                        text=f"✅ Payment successful! Skill #{skill_id} has been activated.\n\n"
                             f"You can now use this skill by sending commands to the bot."
                    )
                    
                    last_checked_id = purchase_id + 1
            
            # 每 10 秒检查一次
            await asyncio.sleep(10)
            
        except Exception as e:
            print(f"Error: {e}")
            await asyncio.sleep(10)

# 运行监听
asyncio.run(monitor_purchases())
```

## 前端部署

### 1. 配置 Telegram WebApp

在 `SkillsBay/public/index.html` 添加：

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### 2. 部署到 Vercel

```bash
cd SkillsBay
pnpm install
pnpm build

# 部署
vercel --prod
```

### 3. 配置 Bot WebApp URL

在 BotFather 中设置：

```
/setmenubutton
选择你的 Bot
输入按钮文本: "🛍️ Skill Store"
输入 WebApp URL: https://your-domain.vercel.app
```

## 测试流程

### 1. 本地测试

```bash
# 启动前端
cd SkillsBay
pnpm dev

# 使用 ngrok 暴露本地服务
ngrok http 3000
```

### 2. 测试购买流程

1. 在 Telegram 中打开 Bot
2. 发送 `/skills` 命令
3. 点击技能按钮
4. 连接 MetaMask（Sepolia 测试网）
5. 确认支付
6. 等待激活通知

### 3. 验证结果

```bash
# 查看购买记录
cast call $SKILL_MARKET_ADDRESS \
  "getPurchase(uint256)" \
  1 \
  --rpc-url $SEPOLIA_RPC_URL

# 查看用户技能
cast call $SKILL_NFT_ADDRESS \
  "getUserSkills(address)" \
  0x你的地址 \
  --rpc-url $SEPOLIA_RPC_URL
```

## 环境变量配置

### 前端 (.env.local)

```bash
NEXT_PUBLIC_SKILL_NFT_ADDRESS=0x你的SkillNFT地址
NEXT_PUBLIC_SKILL_MARKET_ADDRESS=0x你的SkillMarket地址
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

### 后端 (.env)

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ADMIN_PRIVATE_KEY=your_admin_private_key
SKILL_MARKET_ADDRESS=0x你的SkillMarket地址
```

## 安全建议

1. **私钥管理**：使用环境变量或密钥管理服务
2. **权限控制**：只有管理员可以激活购买
3. **事件监听**：使用可靠的 RPC 提供商（Alchemy/Infura）
4. **错误处理**：添加重试机制和日志记录
5. **用户验证**：验证 Telegram WebApp 数据的真实性

## 下一步优化

1. **自动激活**：使用 Chainlink Automation 自动激活购买
2. **多链支持**：部署到 BSC、Polygon 等低 gas 链
3. **NFT 徽章**：为购买的技能生成 NFT 徽章
4. **技能使用统计**：记录技能使用次数和频率
5. **推荐系统**：基于用户行为推荐相关技能
