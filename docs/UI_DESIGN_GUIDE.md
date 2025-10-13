# UI 设计规范文档
## 参考 David UI 的现代化设计系统

基于 David UI 的设计理念和现代 UI 最佳实践

---

## 设计原则

### 1. 视觉层次
- **清晰的信息架构**：通过间距、颜色、阴影建立视觉层次
- **聚焦关键信息**：使用对比和大小引导用户注意力
- **减少视觉噪音**：避免过度装饰，保持简洁

### 2. 一致性
- **统一的视觉语言**：所有组件遵循相同的设计规范
- **可预测的交互**：相似的元素有相似的行为
- **系统化的间距**：使用 4/8/12/16/24/32/48px 的间距系统

### 3. 现代感
- **柔和的阴影**：多层阴影营造深度感
- **流畅的动画**：200-300ms 的过渡时间
- **精致的细节**：圆角、渐变、微妙的边框

---

## 核心设计元素

### 颜色系统

#### 主色调
- **Primary**: `#064ACB` - 用于主要 CTA 和重点元素
- **Secondary**: `#635BFF` - 用于次要元素和辅助操作
- **Accent**: `#7F00FF` (紫色) - 用于强调和特殊状态

#### 中性色
- **背景**: `#FFFFFF` / `#FAFAFA` (浅灰)
- **文字**: `#111111` (标题) / `#717171` (正文)
- **边框**: `#E5E7EB` / `#D1D5DB`

#### 语义色
- **成功**: `#10B981` (绿色)
- **警告**: `#F59E0B` (橙色)
- **错误**: `#DC143C` (深红)
- **信息**: `#3B82F6` (蓝色)

### 阴影系统

```css
/* 小阴影 - 用于按钮、输入框 */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* 中阴影 - 用于卡片 */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* 大阴影 - 用于悬浮卡片 */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* 超大阴影 - 用于模态框、弹出层 */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* 彩色阴影 - 用于品牌元素 */
--shadow-primary: 0 8px 16px -4px rgb(6 74 203 / 0.2);
--shadow-secondary: 0 8px 16px -4px rgb(99 91 255 / 0.2);
```

### 圆角系统

```css
--radius-xs: 4px;   /* 小元素：badge, tag */
--radius-sm: 6px;   /* 按钮、输入框 */
--radius-md: 8px;   /* 卡片内部元素 */
--radius-lg: 12px;  /* 卡片 */
--radius-xl: 16px;  /* 大卡片、面板 */
--radius-2xl: 20px; /* Hero 区域 */
--radius-full: 9999px; /* 圆形元素 */
```

### 间距系统

```css
/* 使用 4px 基准单位 */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

### 排版系统

#### 字体大小
- **xs**: 12px / 0.75rem
- **sm**: 14px / 0.875rem
- **base**: 16px / 1rem
- **lg**: 18px / 1.125rem
- **xl**: 20px / 1.25rem
- **2xl**: 24px / 1.5rem
- **3xl**: 30px / 1.875rem
- **4xl**: 36px / 2.25rem

#### 行高
- **紧凑**: 1.2 - 用于标题
- **正常**: 1.5 - 用于正文
- **宽松**: 1.75 - 用于大段文字

#### 字重
- **Regular**: 400 - 正文
- **Medium**: 500 - 次要标题
- **Semibold**: 600 - 主要标题
- **Bold**: 700 - 强调文字

---

## 组件设计规范

### Card 卡片

#### 基础样式
```tsx
className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
```

#### 变体

**默认卡片**
- 背景：白色
- 边框：1px solid #E5E7EB
- 阴影：shadow-md
- 圆角：12px
- 内边距：24px

**悬浮卡片**
- Hover 时阴影提升到 shadow-lg
- Hover 时轻微向上移动（-2px）
- 过渡时间：300ms

**交互卡片**
- 添加 cursor-pointer
- Hover 时边框颜色变为 primary
- 添加微妙的缩放效果（scale-[1.02]）

**强调卡片**
- 渐变背景：primary → secondary
- 白色文字
- 更强的阴影（shadow-primary）

### Button 按钮

#### 主要按钮（Primary）
```tsx
className="bg-primary text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md hover:bg-primary/90 transition-all duration-200"
```

#### 次要按钮（Secondary）
```tsx
className="bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-all duration-200"
```

#### 幽灵按钮（Ghost）
```tsx
className="text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
```

### Badge 徽章

```tsx
// 状态徽章
<Badge className="px-3 py-1 text-xs font-medium rounded-full">
  <CheckCircle className="w-3 h-3 mr-1" />
  已发布
</Badge>

// 颜色变体
- 成功：bg-green-100 text-green-800
- 警告：bg-yellow-100 text-yellow-800
- 错误：bg-red-100 text-red-800
- 信息：bg-blue-100 text-blue-800
- 中性：bg-gray-100 text-gray-800
```

### 输入框

```tsx
className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
```

---

## 页面布局规范

### 间距规范

#### 页面级间距
- **顶部/底部 padding**: 48px (lg: 64px)
- **左右 padding**: 16px (sm: 24px, lg: 32px)
- **最大宽度**: 1280px (7xl)

#### 区块间距
- **大区块间距**: 64px (vertical)
- **中区块间距**: 32px (vertical)
- **小区块间距**: 16px (vertical)

#### 卡片内部间距
- **卡片 padding**: 24px (lg: 32px)
- **标题与内容间距**: 16px
- **段落间距**: 12px

### 网格系统

```tsx
// 响应式网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
  {/* 内容 */}
</div>

// 两栏布局（主内容 + 侧边栏）
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">{/* 主内容 */}</div>
  <div>{/* 侧边栏 */}</div>
</div>
```

---

## 微交互规范

### 过渡动画

```css
/* 快速交互 - 按钮、链接 */
transition: all 150ms ease-in-out;

/* 标准交互 - 卡片、下拉菜单 */
transition: all 200ms ease-in-out;

/* 复杂交互 - 模态框、页面转换 */
transition: all 300ms ease-in-out;
```

### Hover 效果

**卡片 Hover**
```tsx
className="transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
```

**按钮 Hover**
```tsx
className="hover:scale-105 active:scale-95 transition-transform duration-150"
```

**链接 Hover**
```tsx
className="hover:text-primary hover:underline transition-colors duration-200"
```

### 加载状态

**骨架屏**
```tsx
className="animate-pulse bg-gray-200 rounded"
```

**旋转动画**
```tsx
className="animate-spin rounded-full border-2 border-gray-300 border-t-primary"
```

---

## 响应式设计

### 断点
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### 移动端优化
- 增大触摸目标（最小 44x44px）
- 简化导航结构
- 优化间距（减小 padding/margin）
- 隐藏非关键信息
- 调整字体大小

---

## 可访问性

- **颜色对比度**: WCAG AA 标准（最小 4.5:1）
- **键盘导航**: 所有交互元素支持 Tab 导航
- **焦点状态**: 清晰的 focus ring
- **ARIA 标签**: 为屏幕阅读器提供语义信息
- **文本大小**: 最小 14px，重要内容 16px+

---

## 实施检查清单

### Phase 1: 基础优化
- [ ] 更新全局样式和颜色变量
- [ ] 优化 Card 组件样式
- [ ] 优化 Button 组件样式
- [ ] 优化 Badge 组件样式
- [ ] 更新阴影系统

### Phase 2: 页面优化
- [ ] 优化量表详情页
- [ ] 优化功能介绍区
- [ ] 优化表单页面
- [ ] 优化列表页面

### Phase 3: 交互优化
- [ ] 添加 hover 效果
- [ ] 添加过渡动画
- [ ] 优化加载状态
- [ ] 优化错误状态

### Phase 4: 测试和调优
- [ ] 响应式测试（移动端、平板、桌面）
- [ ] 浏览器兼容性测试
- [ ] 性能测试（动画流畅度）
- [ ] 可访问性测试

---

**最后更新**: 2025-10-12
**设计系统版本**: v1.0
