# xCOA Light Theme 颜色配置指南

## 🎨 主色彩方案

### 核心颜色变量
```css
--theme-color: #635BFF;      /* 主题金黄色 - 温暖、专业 */
--secondary-color: #064ACB;   /* 蓝色 - 信任、科技 */
--pink-color: #FFC0CB;       /* 粉色 - 温和、关怀 */
--violet-color: #7F00FF;     /* 紫色 - 创新、智慧 */
--crimson-color: #DC143C;    /* 深红色 - 警告、重要 */
--orange-color: #FF6500;     /* 橙色 - 活力、注意 */
--text-color: #717171;       /* 文本灰色 - 易读、舒适 */
--title-color: #111111;      /* 标题深色 - 强调、对比 */
```

## 🎯 颜色应用场景

### 主要功能色彩
- **Primary (蓝色 #064ACB)**: 主要按钮、链接、强调元素
- **Secondary (金黄色 #635BFF)**: 次要强调、卡片背景、标签
- **Text (灰色 #717171)**: 正文内容、描述文字
- **Title (深色 #111111)**: 标题、重要文本

### 功能状态色彩
- **Accent Violet (#7F00FF)**: 交互元素、hover状态
- **Accent Pink (#FFC0CB)**: 成功状态、完成指示
- **Crimson (#DC143C)**: 错误、警告、删除操作
- **Orange (#FF6500)**: 提醒、进度、活跃状态

## 💡 CSS工具类

### 背景色
```css
.bg-theme-primary      /* 金黄色背景 */
.bg-theme-secondary    /* 蓝色背景 */
.bg-accent-pink        /* 粉色背景 */
.bg-accent-violet      /* 紫色背景 */
.bg-accent-crimson     /* 深红色背景 */
.bg-accent-orange      /* 橙色背景 */
```

### 文字色
```css
.text-theme-primary    /* 金黄色文字 */
.text-theme-secondary  /* 蓝色文字 */
.text-theme-text       /* 正文灰色 */
.text-theme-title      /* 标题深色 */
.text-accent-*         /* 各种强调色文字 */
```

### 边框色
```css
.border-theme-primary    /* 金黄色边框 */
.border-theme-secondary  /* 蓝色边框 */
```

### 渐变背景
```css
.gradient-theme-primary  /* 金黄到蓝色渐变 */
.gradient-theme-accent   /* 粉色到紫色渐变 */
.gradient-theme-warm     /* 金黄到橙色渐变 */
```

## 🎨 使用示例

### 在React组件中使用
```typescript
// 主要操作按钮
<Button className="bg-theme-secondary text-white hover:bg-opacity-90">
  开始评估
</Button>

// 强调卡片
<Card className="border-theme-primary bg-gradient-to-br from-yellow-50 to-white">
  {/* 内容 */}
</Card>

// 状态指示
<Badge className="bg-accent-pink text-crimson-700">
  已完成
</Badge>

// 渐变背景区域
<div className="gradient-theme-primary p-6 rounded-lg text-white">
  欢迎使用 xCOA 平台
</div>
```

## 🌟 视觉效果

### Light主题下的视觉层次
1. **主背景**: 纯白色 (#FFFFFF)
2. **卡片背景**: 浅灰色系
3. **主要强调**: 蓝色 (#064ACB) - 按钮、链接
4. **次要强调**: 金黄色 (#635BFF) - 标签、高亮
5. **文本内容**: 灰色 (#717171) - 易读舒适
6. **标题文字**: 深色 (#111111) - 清晰对比

### 功能区域配色
- **搜索区域**: 蓝色边框 + 白色背景
- **结果卡片**: 浅色边框 + 阴影效果
- **交互按钮**: 金黄色强调
- **状态提示**: 对应功能的语义色彩

## 🚀 品牌一致性

这套配色方案为xCOA平台提供了：
- ✅ **专业性**: 医疗科研级别的视觉标准
- ✅ **易用性**: 高对比度确保可读性
- ✅ **现代感**: 渐变和阴影效果提升质感
- ✅ **温和性**: 避免过于刺眼的颜色
- ✅ **可扩展性**: 完整的颜色变量系统

---

**配色理念**: 以蓝色建立信任感，以金黄色增加温暖感，确保专业、友好、易用的用户体验。