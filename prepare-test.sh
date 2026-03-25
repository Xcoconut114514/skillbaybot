#!/bin/bash

echo "🎬 准备前端测试环境"
echo "===================="
echo ""

# 合约地址
ATT_TOKEN="0x5FbDB2315678afecb367f032d93F642f64180aa3"
STAKING_POOL="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
REWARD_POOL="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

# 账户
DEPLOYER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
DEPLOYER_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
STREAMER="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
VIEWER="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

RPC_URL="http://127.0.0.1:8545"

echo "📋 配置信息:"
echo "   ATT Token: $ATT_TOKEN"
echo "   Staking Pool: $STAKING_POOL"
echo "   Reward Pool: $REWARD_POOL"
echo ""

# 检查 Anvil 是否运行
echo "🔍 检查 Anvil 是否运行..."
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' $RPC_URL > /dev/null; then
    echo "❌ Anvil 未运行！"
    echo ""
    echo "请在另一个终端启动 Anvil:"
    echo "   anvil"
    echo ""
    exit 1
fi
echo "✅ Anvil 正在运行"
echo ""

# 1. 给主播转账 ATT
echo "💰 步骤 1: 给主播转账 100,000 ATT..."
cast send $ATT_TOKEN \
  "transfer(address,uint256)" \
  $STREAMER \
  100000000000000000000000 \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_KEY \
  > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ 转账成功"
else
    echo "❌ 转账失败"
fi
echo ""

# 2. 查询主播余额
echo "📊 步骤 2: 查询主播 ATT 余额..."
BALANCE=$(cast call $ATT_TOKEN "balanceOf(address)(uint256)" $STREAMER --rpc-url $RPC_URL)
BALANCE_ETH=$(cast --to-unit $BALANCE ether)
echo "   主播余额: $BALANCE_ETH ATT"
echo ""

# 3. 给观众转账一些 ATT（可选）
echo "💰 步骤 3: 给观众转账 10,000 ATT..."
cast send $ATT_TOKEN \
  "transfer(address,uint256)" \
  $VIEWER \
  10000000000000000000000 \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_KEY \
  > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ 转账成功"
else
    echo "❌ 转账失败"
fi
echo ""

echo "✅ 测试环境准备完成！"
echo ""
echo "📝 下一步:"
echo "   1. 启动前端: cd AttentionLive && npm run dev"
echo "   2. 配置 MetaMask (见 FRONTEND_TESTING.md)"
echo "   3. 导入测试账户:"
echo "      - Streamer: $STREAMER"
echo "      - Viewer: $VIEWER"
echo "   4. 访问: http://localhost:3000/staking"
echo ""
echo "📚 详细测试指南: AttentionLive/FRONTEND_TESTING.md"
