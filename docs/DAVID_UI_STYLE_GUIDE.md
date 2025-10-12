# David UI 真实设计风格指南
基于 david-ai-main 源代码分析

---

## 1. 颜色系统

### 主色系 - Stone
David UI 使用 **stone 色系**作为主要配色，而不是 gray：

```css
/* 边框 */
border-stone-200

/* 文本 */
text-stone-600      /* 正文 */
text-current       /* 标题 */

/* 背景 */
bg-stone-800       /* 按钮深色 */
bg-stone-700       /* 按钮渐变起点 */
bg-white           /* 卡片背景 */

/* 边框 */
border-stone-900   /* 按钮边框 */
border-stone-200   /* 卡片边框 */
```

### 阴影颜色
```css
shadow-stone-950/5  /* 极其柔和的阴影，几乎不可见 */
```

---

## 2. 阴影系统

### 基础阴影
```css
/* 小阴影 - 卡片默认 */
shadow-sm

/* 中阴影 - hover 状态 */
shadow-md

/* 阴影颜色 */
shadow-stone-950/5   /* 所有阴影使用这个柔和的颜色 */
```

### 内阴影（按钮专用）
```css
after:absolute
after:inset-0
after:rounded-[inherit]
after:box-shadow
after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)]
after:pointer-events-none
```

**效果：**
- 顶部高光：`inset 0 1px 0px rgba(255,255,255,0.25)`
- 底部阴影：`inset 0 -2px 0px rgba(0,0,0,0.35)`
- 创造立体感和深度

---

## 3. 圆角系统

```css
rounded-lg   /* 卡片、按钮 (12px) */
rounded      /* 图片、小元素 (4px) */
rounded-[inherit]  /* 继承父元素圆角 */
```

---

## 4. 间距系统

David UI 使用**精确的小数间距**：

### 内边距
```css
px-3.5   /* 14px - 卡片内部水平 */
py-2.5   /* 10px - 卡片内部垂直 */
pt-2     /* 8px */
pb-3.5   /* 14px */
```

### 外边距
```css
m-2      /* 8px - 图片外边距 */
mt-1     /* 4px - 段落顶部 */
mt-4     /* 16px - 区块间距 */
```

### 按钮间距
```css
py-2     /* 垂直 8px */
px-4     /* 水平 16px */
```

---

## 5. 按钮设计

### 完整按钮类名（David UI 风格）

```css
inline-flex items-center justify-center
border
align-middle
select-none
font-sans
font-medium
text-center
duration-300
ease-in
disabled:opacity-50
disabled:shadow-none
disabled:cursor-not-allowed
focus:shadow-none
text-sm
py-2
px-4
shadow-sm
hover:shadow-md
bg-stone-800
hover:bg-stone-700
relative
bg-gradient-to-b
from-stone-700
to-stone-800
border-stone-900
text-stone-50
rounded-lg
hover:bg-gradient-to-b
hover:from-stone-800
hover:to-stone-800
hover:border-stone-900
after:absolute
after:inset-0
after:rounded-[inherit]
after:box-shadow
after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)]
after:pointer-events-none
transition
antialiased
```

### 关键特征
1. **渐变背景**：`bg-gradient-to-b from-stone-700 to-stone-800`
2. **内阴影**：通过 `after` 伪元素实现立体效果
3. **Hover 效果**：阴影提升 + 渐变微调
4. **边框**：`border-stone-900`
5. **文字**：`text-stone-50` 浅色文字

---

## 6. 卡片设计

### 完整卡片类名（David UI 风格）

```css
w-full
rounded-lg
border
shadow-sm
overflow-hidden
bg-white
border-stone-200
shadow-stone-950/5
max-w-xs
```

### 卡片内部
```html
<!-- 头部 -->
<div class="w-full h-max rounded px-3.5 py-2.5">
  <h6 class="font-sans antialiased font-bold text-base md:text-lg lg:text-xl text-current">
    标题
  </h6>
  <p class="font-sans antialiased text-base my-1 text-stone-600">
    描述文本
  </p>
</div>

<!-- 底部 -->
<div class="w-full px-3.5 pt-2 pb-3.5 rounded">
  <!-- 按钮或其他元素 -->
</div>
```

### 关键特征
1. **极简边框**：`border-stone-200`
2. **柔和阴影**：`shadow-sm shadow-stone-950/5`
3. **白色背景**：`bg-white`
4. **精确间距**：`px-3.5 py-2.5`
5. **圆角**：`rounded-lg`

---

## 7. 字体系统

### 标题
```css
font-sans
antialiased
font-bold
text-base md:text-lg lg:text-xl
text-current
```

### 正文
```css
font-sans
antialiased
text-base
text-stone-600
```

### 小字
```css
font-sans
antialiased
text-sm
text-current
```

### 响应式字号
- `text-base`：16px (默认)
- `md:text-lg`：18px (中等屏幕)
- `lg:text-xl`：20px (大屏幕)

---

## 8. 过渡动画

```css
duration-300      /* 300ms */
ease-in           /* 缓动函数 */
transition        /* 通用过渡 */
```

---

## 9. 图片处理

```html
<img
  src="..."
  alt="..."
  class="w-[calc(100%-16px)] h-max rounded m-2"
/>
```

**特点：**
- 宽度：`w-[calc(100%-16px)]` 留出边距
- 圆角：`rounded`
- 外边距：`m-2`

---

## 10. Hover 状态

### 卡片
```css
hover:shadow-lg          /* 阴影加深 */
hover:z-10               /* 层级提升 */
```

### 按钮
```css
hover:shadow-md          /* 阴影提升 */
hover:bg-stone-700       /* 背景变浅 */
hover:from-stone-800     /* 渐变调整 */
hover:to-stone-800
```

### 图片
```css
hover:z-10               /* 提升层级 */
```

---

## 11. Disabled 状态

```css
disabled:opacity-50
disabled:shadow-none
disabled:cursor-not-allowed
```

---

## 12. 响应式设计

### 文本大小
```css
text-base md:text-lg lg:text-xl
```

### 布局
```css
max-w-xs      /* 小卡片 320px */
max-w-[24rem] /* 中卡片 384px */
w-full        /* 全宽 */
```

---

## 13. 布局技巧

### Flexbox
```css
flex items-center justify-between
flex items-center -space-x-3     /* 重叠头像 */
inline-flex items-center justify-center
```

### 尺寸
```css
w-full        /* 宽度100% */
h-max         /* 高度自适应 */
w-8 h-8       /* 固定尺寸（头像） */
```

---

## 14. 特殊效果

### 重叠头像
```css
<div class="flex items-center -space-x-3">
  <img class="w-8 h-8 rounded border-2 border-stone-200 hover:z-10" />
  <img class="w-8 h-8 rounded border-2 border-stone-200 hover:z-10" />
</div>
```

### 渐变遮罩（背景图片）
```css
bg-gradient-to-t from-stone-900/50 to-transparent
```

---

## 实施步骤

### Step 1: 更新颜色变量
将所有 `gray` 替换为 `stone`

### Step 2: 更新阴影
使用 `shadow-stone-950/5`

### Step 3: 更新按钮
添加渐变 + 内阴影

### Step 4: 更新卡片
使用精确间距（3.5, 2.5）

### Step 5: 添加反锯齿
所有文本添加 `antialiased`

---

**最后更新**: 2025-10-12
**基于**: david-ai-main 源代码
