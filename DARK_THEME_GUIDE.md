# 深色极客风格设计指南

## 已完成页面
- ✅ Home (`/home`)
- ✅ Products (`/products`)
- ⏳ Financing (`/financing`)
- ⏳ Pools (`/pools`)
- ⏳ Settlement (`/settlement`)
- ⏳ Analytics (`/analytics`)

## 设计规范

### 颜色方案
```css
/* 背景色 */
bg-black           /* 主背景 */
bg-zinc-900        /* 卡片背景 */
bg-zinc-800        /* 次级元素 */

/* 文字颜色 */
text-gray-200      /* 主要文字 */
text-gray-400      /* 次要文字 */
text-gray-500      /* 辅助文字 */

/* 强调色 */
from-yellow-400 to-orange-500  /* 标题渐变 */
from-yellow-600 to-orange-600  /* 按钮渐变 */
text-yellow-500                 /* 数值/重要信息 */

/* 边框 */
border-zinc-800    /* 卡片边框 */
border-zinc-700    /* 输入框边框 */
```

### 组件样式

#### Card
```tsx
<Card className="bg-zinc-900/50 border border-zinc-800">
  <CardHeader className="border-b border-zinc-800 p-6">
    <h2 className="text-xl font-semibold text-gray-200">Title</h2>
  </CardHeader>
  <CardBody className="p-6">
    {/* Content */}
  </CardBody>
</Card>
```

#### Button
```tsx
// 主按钮
<Button className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
  Action
</Button>

// 次要按钮
<Button className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700">
  Action
</Button>
```

#### Input
```tsx
<Input
  classNames={{
    input: "bg-zinc-800 text-gray-200",
    inputWrapper: "bg-zinc-800 border-zinc-700",
    label: "text-gray-400",
  }}
  variant="bordered"
/>
```

#### Table
```tsx
<Table 
  classNames={{
    wrapper: "bg-transparent shadow-none",
    th: "bg-zinc-800 text-gray-400 font-semibold",
    td: "text-gray-300 border-b border-zinc-800",
  }}
>
```

#### Chip/Badge
```tsx
// 成功状态
<Chip className="bg-green-900/30 text-green-400 border border-green-800">
  Success
</Chip>

// 警告状态
<Chip className="bg-yellow-900/30 text-yellow-400 border border-yellow-800">
  Warning
</Chip>

// 信息状态
<Chip className="bg-blue-900/30 text-blue-400 border border-blue-800">
  Info
</Chip>
```

### 标题样式
```tsx
// 页面主标题
<h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
  Page Title
</h1>

// 副标题
<p className="text-gray-500">Subtitle text</p>
```

### Hover 效果
```tsx
// 卡片 hover
className="hover:bg-zinc-800/50 transition-colors"

// 按钮 hover
className="hover:bg-zinc-700 transition-colors"

// 边框 hover
className="hover:border-yellow-600/50 transition-all"
```

## 快速替换指南

### 1. 背景色替换
```
bg-white/80 → bg-zinc-900/50
bg-gray-50 → bg-zinc-800
bg-gradient-to-br from-blue-50 → bg-zinc-900/50
```

### 2. 文字颜色替换
```
text-gray-800 → text-gray-200
text-gray-600 → text-gray-400
text-gray-500 → text-gray-500 (保持)
```

### 3. 边框替换
```
border-gray-200 → border-zinc-800
border-gray-300 → border-zinc-700
```

### 4. 强调色替换
```
text-blue-600 → text-yellow-500
text-green-600 → text-yellow-500
bg-blue-500 → bg-gradient-to-r from-yellow-600 to-orange-600
```

## 示例：完整页面结构
```tsx
export default function PageName() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* 标题 */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
          Page Title
        </h1>
        <p className="text-gray-500">Description</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900/50 border border-zinc-800">
          <CardBody className="p-6">
            {/* Stats content */}
          </CardBody>
        </Card>
      </div>

      {/* 主内容 */}
      <Card className="bg-zinc-900/50 border border-zinc-800">
        <CardHeader className="border-b border-zinc-800 p-6">
          <h2 className="text-xl font-semibold text-gray-200">Section Title</h2>
        </CardHeader>
        <CardBody className="p-6">
          {/* Main content */}
        </CardBody>
      </Card>
    </div>
  );
}
```
