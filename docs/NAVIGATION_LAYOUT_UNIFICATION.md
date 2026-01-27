# 导航布局统一文档

## 📋 问题描述

自媒体页面和营销页面的导航布局与通用写作页面不一致：
- **原有布局**：所有分类都在左侧垂直导航栏中
- **目标布局**：第二层分类使用顶部横向标签页，第三层分类使用左侧垂直导航

## 🎯 解决方案

将自媒体页面和营销页面的布局结构改为与通用写作页面一致的"横向标签页 + 垂直导航"模式。

## 📐 布局结构

### 目标布局示意图

```
┌─────────────────────────────────────────────────────────┐
│  横向标签页（第二层分类）                                  │
│  [分类1] [分类2] [分类3] ...                              │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  左侧    │         右侧内容区域                          │
│  垂直    │      （模板卡片网格）                         │
│  导航    │                                              │
│ (第三层) │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 核心代码结构

```tsx
<div className="flex flex-col h-[calc(100vh-56px)]">
  {/* 第二层导航 - 横向标签页 */}
  <div className="border-b border-border bg-card">
    <div className="flex items-center px-6 h-14">
      {categories.map((category) => (
        <button
          className={cn(
            "px-6 h-full text-sm font-medium transition-colors relative",
            active ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {category.label}
          {active && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  </div>

  <div className="flex flex-1 overflow-hidden">
    {/* 左侧垂直导航 - 第三层分类 */}
    <div className="w-48 border-r border-border bg-card overflow-y-auto">
      <div className="p-2">
        {/* 子分类按钮 */}
      </div>
    </div>

    {/* 右侧内容区域 */}
    <div className="flex-1 p-6 overflow-y-auto">
      {/* 内容 */}
    </div>
  </div>
</div>
```

## 🔧 具体修改步骤

### 1. 自媒体页面 (media-page.tsx)

#### 修改前结构
```tsx
<div className="flex min-h-[calc(100vh-56px)] bg-background">
  <div className="w-48 border-r border-border bg-card">
    {/* 所有分类都在左侧 */}
  </div>
  <div className="flex-1 p-6 overflow-y-auto">
    {/* 内容区域 */}
  </div>
</div>
```

#### 修改后结构
```tsx
<div className="flex flex-col h-[calc(100vh-56px)]">
  {/* 横向标签页：自媒体文案 / 短视频文案 / 直播文案 */}
  <div className="border-b border-border bg-card">
    <div className="flex items-center px-6 h-14">
      {secondLevelCategories.map((category) => (
        <button key={category.id} /* ... */>
          {category.label}
          {activeSecondLevel === category.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  </div>

  <div className="flex flex-1 overflow-hidden">
    {/* 左侧垂直导航：小红书、公众号等 */}
    <div className="w-48 border-r border-border bg-card overflow-y-auto">
      {/* ... */}
    </div>

    {/* 右侧内容区域 */}
    <div className="flex-1 p-6 overflow-y-auto">
      {/* ... */}
    </div>
  </div>
</div>
```

### 2. 营销页面 (marketing-page.tsx)

#### 修改要点
- 将 `marketingSecondLevelCategories`（品牌、创意、媒介等）移到顶部横向标签页
- 将 `brandSubCategories`（品牌战略、市场分析等）保留在左侧垂直导航
- 其他第二层分类（创意、媒介等）没有第三层，左侧导航为空

## ⚠️ 常见问题与解决方案

### 问题1：JSX 结构错误 - 缺少闭合标签

**错误信息**：
```
JSX 元素'div'没有相应的结束标记
Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
```

**原因**：
在重构布局时，容易遗漏最外层容器的闭合标签。

**解决方案**：
确保所有 div 标签正确闭合，结构应该是：
```tsx
return (
  <div className="flex flex-col h-[calc(100vh-56px)]">  {/* 外层容器 */}
    <div className="border-b border-border bg-card">     {/* 横向标签页 */}
      {/* ... */}
    </div>

    <div className="flex flex-1 overflow-hidden">        {/* flex 容器 */}
      <div className="w-48 border-r ...">               {/* 左侧导航 */}
        {/* ... */}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">      {/* 右侧内容 */}
        {/* ... */}
      </div>
    </div>  {/* 闭合 flex 容器 */}
  </div>    {/* 闭合外层容器 */}
);
```

### 问题2：容器高度设置

**关键点**：
- 外层容器使用 `h-[calc(100vh-56px)]` 固定高度（56px 是顶部导航栏高度）
- 使用 `flex flex-col` 实现垂直布局
- 中间的 flex 容器使用 `flex-1 overflow-hidden` 占据剩余空间

### 问题3：横向标签页的激活状态指示器

**实现方式**：
```tsx
{activeSecondLevel === category.id && (
  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
)}
```

这会在激活的标签页底部显示一条蓝色指示线。

## ✅ 验证步骤

### 1. 构建验证
```bash
npm run build
```

确保没有编译错误。

### 2. 开发服务器验证
```bash
npm run dev
```

访问 http://localhost:3000 检查：
- 自媒体页面：横向标签页是否正常显示
- 营销页面：横向标签页是否正常显示
- 点击标签页切换是否正常
- 左侧导航是否根据横向标签页动态变化
- 右侧内容区域是否正确显示

### 3. 功能测试清单
- [ ] 横向标签页点击切换正常
- [ ] 激活状态指示器显示正确
- [ ] 左侧导航根据横向标签页动态显示
- [ ] 左侧导航点击滚动到对应内容
- [ ] 右侧内容区域滚动正常
- [ ] 模板卡片点击跳转正常

## 📝 关键代码片段

### 横向标签页按钮样式
```tsx
className={cn(
  "px-6 h-full text-sm font-medium transition-colors relative",
  activeSecondLevel === category.id
    ? "text-primary"
    : "text-muted-foreground hover:text-foreground"
)}
```

### 左侧导航按钮样式
```tsx
className={cn(
  "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1",
  activeThirdLevel === category.id
    ? "bg-primary text-primary-foreground"
    : "hover:bg-muted text-foreground"
)}
```

## 🎨 样式说明

### Tailwind CSS 类名解释
- `flex flex-col`：垂直 flex 布局
- `h-[calc(100vh-56px)]`：高度为视口高度减去 56px
- `flex-1`：占据剩余空间
- `overflow-hidden`：隐藏溢出内容
- `overflow-y-auto`：垂直方向可滚动
- `border-b border-border`：底部边框
- `bg-card`：卡片背景色
- `text-primary`：主题色文字
- `text-muted-foreground`：次要文字颜色

## 📚 参考文件

- 参考模板：`components/general-writing-page.tsx`
- 修改文件：
  - `components/media-page.tsx`
  - `components/marketing-page.tsx`

## �� 后续维护

如果需要添加新的页面并使用相同的布局模式：

1. 复制 `general-writing-page.tsx` 的布局结构
2. 定义第二层分类数组（横向标签页）
3. 定义第三层分类数组（左侧导航）
4. 实现状态管理和切换逻辑
5. 确保所有 div 标签正确闭合

---

**文档创建时间**：2026-01-27
**最后更新时间**：2026-01-27
**适用版本**：Next.js 16.0.10
