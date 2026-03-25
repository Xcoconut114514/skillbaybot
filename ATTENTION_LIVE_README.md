# Attention LIVE - 前端 MVP

基于 Next.js 的 Watch-to-Earn 直播激励平台前端应用。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

开发模式下使用 Mock 数据，无需配置后端：

```env
NEXT_PUBLIC_USE_MOCK=true
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
├── app/
│   ├── (with-nav)/          # 带导航栏的页面
│   │   ├── tasks/           # 任务大厅
│   │   ├── profile/         # 个人中心
│   │   ├── leaderboard/     # 排行榜
│   │   └── streamer/        # 主播控制台
│   └── layout.tsx
├── components/
│   └── attention/           # Attention LIVE 组件
│       ├── TaskCard.tsx     # 任务卡片
│       ├── VerificationModal.tsx  # 验证码模态框
│       └── SuccessAnimation.tsx   # 成功动画
├── lib/
│   └── api/
│       ├── attention.ts     # API 服务层
│       └── mock-data.ts     # Mock 数据
└── types/
    └── attention.ts         # 类型定义
```

## 🎯 核心功能

### 1. 任务大厅 (`/tasks`)
- 展示所有可参与的直播任务
- 显示任务状态（直播中/即将开始/已结束）
- 点击跳转至币安直播间
- 弹出验证码输入框

### 2. 验证码验证
- 60秒倒计时
- 实时验证反馈
- 成功动画展示

### 3. 个人中心 (`/profile`)
- 显示总积分和排名
- 积分历史记录
- 参与任务列表

### 4. 排行榜 (`/leaderboard`)
- Top 50 用户排名
- 前三名奖牌展示
- 实时积分更新

### 5. 主播控制台 (`/streamer`)
- 当前观众数
- 累计积分
- 验证成功率
- 实时数据刷新（每10秒）

## 🧪 Mock 数据测试

开发模式下使用 Mock 数据，验证码输入 `1234` 即可成功验证。

## 🔌 API 集成

生产环境下，设置环境变量：

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://api.attention.live/api
```

### API 端点

- `GET /tasks` - 获取任务列表
- `GET /tasks/:id` - 获取任务详情
- `POST /verify` - 提交验证码
- `GET /users/:id` - 获取用户信息
- `GET /users/:id/points` - 获取积分记录
- `GET /leaderboard` - 获取排行榜
- `GET /streamers/:id/stats` - 获取主播统计

## 🎨 UI 组件库

使用 HeroUI (NextUI fork) 组件库，支持：
- 深色模式
- 响应式设计
- 流畅动画
- 无障碍访问

## 📱 响应式设计

- 移动端优先
- 平板适配
- 桌面端优化

## 🔐 安全特性

- 验证码倒计时限制
- API 请求频率控制（后端实现）
- 用户身份验证（预留）

## 🚧 待实现功能

- [ ] 币安 OAuth 登录集成
- [ ] Web3 钱包连接
- [ ] 积分兑换代币
- [ ] 实时通知推送
- [ ] 多语言支持

## 📝 开发说明

### Mock 验证码
开发模式下，验证码固定为 `1234`，方便测试。

### 用户 ID
当前使用硬编码的 `user-123`，实际应从认证系统获取。

### 主播 ID
主播控制台使用 `streamer-123`，需要根据登录用户动态获取。
