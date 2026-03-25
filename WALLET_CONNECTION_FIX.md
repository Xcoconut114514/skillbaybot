# 钱包连接问题修复（本地测试版）

## 问题描述
点击"连接钱包"按钮没有反应，只是触发了 `GET /profile 200` 请求。

## 根本原因
1. **错误的按钮实现**：`navbar.tsx` 中的"连接钱包"按钮实际上是一个链接到 `/profile` 页面的按钮，而不是真正的钱包连接组件
2. **网络配置不匹配**：原始的 `ConnectWallet.tsx` 组件试图切换到 Sepolia 网络，但配置使用的是 BSC 测试网和本地网络

## 修复内容

### 1. 替换了 navbar 中的假按钮
```typescript
// 之前：链接到 /profile 页面
<Button as={NextLink} href="/profile">连接钱包</Button>

// 现在：使用真正的钱包连接组件
<ConnectWallet />
```

### 2. 简化了连接逻辑（针对本地测试）
- ✅ 移除了强制网络切换逻辑
- ✅ 支持本地网络 (chainId: 31337) 直接连接
- ✅ 添加了详细的调试日志
- ✅ 改进了错误处理

### 2. 本地测试配置
确保你的 MetaMask 已连接到本地网络：
- Network Name: Localhost 8545
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

## 本地测试步骤

### 1. 确保 Hardhat 节点正在运行
```bash
cd AttentionLive_contract
npx hardhat node
```

### 2. 启动前端开发服务器
```bash
cd AttentionLive
pnpm dev
```

### 3. 配置 MetaMask
- 打开 MetaMask
- 切换到 "Localhost 8545" 网络
- 如果没有，手动添加：
  - Network Name: Localhost 8545
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency Symbol: ETH

### 4. 导入测试账户（可选）
从 Hardhat 节点输出中复制私钥，导入到 MetaMask：
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 5. 测试连接
1. 打开浏览器控制台（F12）
2. 访问 http://localhost:3000
3. 点击 "Connect" 按钮
4. 查看控制台日志：

```
🔍 ConnectWallet 组件状态: { isConnected: false, connectorsCount: 1, ... }
🔗 开始钱包连接
📋 可用连接器: [...]
🔗 当前链 ID: 31337 (31337=localhost, 97=BSC Testnet)
🔌 尝试连接钱包...
🔍 找到的连接器: {...}
✅ 使用 injected 连接器
✅ 连接成功！
```

### 6. 预期行为
- MetaMask 弹出连接请求
- 点击"连接"后，按钮显示地址缩写（如 0xf39F...2266）
- 控制台显示 "✅ 连接成功！"

## 常见问题

### 问题 1: 连接器数组为空
**症状**: 控制台显示 `connectorsCount: 0`
**原因**: wagmi 配置未正确加载
**解决**: 
1. 检查 `AttentionLive/config/wagmi.ts`
2. 确保 `injected()` 连接器已配置
3. 重启开发服务器

### 问题 2: 网络不匹配
**症状**: MetaMask 显示错误的网络
**解决**: 
1. 在 MetaMask 中手动切换到 "Localhost 8545"
2. 确认 Chain ID 是 31337

### 问题 3: 没有检测到钱包
**症状**: 弹出"未检测到 MetaMask 或 OKX 钱包"
**解决**: 
1. 安装 MetaMask 浏览器扩展
2. 刷新页面
3. 确保 MetaMask 已解锁

### 问题 4: 连接后立即断开
**症状**: 连接成功但马上又断开
**解决**: 
1. 检查 Hardhat 节点是否正在运行
2. 检查 RPC URL 是否正确（http://127.0.0.1:8545）
3. 查看控制台是否有 RPC 错误

## 调试技巧

### 1. 查看详细日志
所有关键步骤都有日志输出：
- 🔍 = 状态检查
- 🔗 = 连接过程
- 🔌 = 钱包操作
- ✅ = 成功
- ❌ = 错误

### 2. 手动测试钱包连接
在浏览器控制台运行：
```javascript
// 检查钱包是否可用
console.log('Ethereum:', window.ethereum)

// 查看当前账户
window.ethereum.request({ method: 'eth_accounts' })

// 查看当前链 ID
window.ethereum.request({ method: 'eth_chainId' })

// 手动请求连接
window.ethereum.request({ method: 'eth_requestAccounts' })
```

### 3. 检查 wagmi 配置
```javascript
// 在组件中添加
console.log('Wagmi Config:', wagmiConfig)
console.log('Connectors:', connectors)
```

## 下一步

连接成功后，你可以：
1. 测试质押功能
2. 测试代币转账
3. 测试合约交互

参考文档：
- `AttentionLive/FRONTEND_TESTING.md` - 前端测试指南
- `AttentionLive_contract/LOCAL_TESTING.md` - 合约本地测试
- `HOW_TO_TEST_LOCALLY.md` - 完整本地测试流程
