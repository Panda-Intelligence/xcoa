# E2E 测试指南

## 📋 概述

本目录包含 OpeneCOA 订阅系统的端到端测试，使用 Playwright 测试框架。

## 🚀 快速开始

### 安装依赖

```bash
cd e2e
pnpm install
pnpm exec playwright install
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行订阅权限测试
pnpm test:subscription

# 带界面运行（调试用）
pnpm test:headed

# 调试模式
pnpm test:debug

# 查看测试报告
pnpm test:report
```

## 📁 目录结构

```
e2e/
├── tests/
│   └── subscription/
│       └── subscription-permissions.spec.ts  # 订阅权限测试
├── helpers/
│   └── subscription-helper.ts               # 测试辅助工具
├── fixtures/
│   └── users.ts                            # 测试数据
├── config/
│   └── test-environment.ts                 # 测试环境配置
├── playwright.config.ts                    # Playwright配置
└── package.json
```

## 🧪 测试覆盖

### 订阅计划权限测试

#### 免费版 (Free Plan)
- ✅ 搜索限制（30次/月）
- ✅ 量表查看限制（5个/月）
- ✅ PDF导出带水印
- ✅ AI解读功能限制
- ✅ 案例库访问限制
- ✅ 数据导出限制

#### 专业版 (Professional Plan)
- ✅ 无限搜索
- ✅ 量表查看限制（100个/月）
- ✅ AI解读（20次/月）
- ✅ 无水印PDF导出
- ✅ 案例库访问
- ✅ API访问限制

#### 高级版 (Advanced Plan)
- ✅ 无限量表查看
- ✅ AI解读（100次/月）
- ✅ API访问（10000次/月）
- ✅ 团队协作（5人）

#### 企业版 (Enterprise Plan)
- ✅ 所有功能无限制
- ✅ 版权协助功能
- ✅ 无限API访问
- ✅ 无限团队成员

### 使用量限制测试
- ✅ 接近限制警告（80%）
- ✅ 达到限制阻止
- ✅ 升级提示和跳转

### 订阅升级流程
- ✅ 免费升级到付费
- ✅ Stripe支付集成
- ✅ 订阅取消流程

## 🔧 测试辅助工具

### SubscriptionTestHelper

```typescript
const helper = new SubscriptionTestHelper(page);

// 登录为测试用户
await helper.loginAs(mockUsers.freeUser);

// 获取使用量统计
const usage = await helper.getUsageStats();

// 检查功能权限
const hasAccess = await helper.checkFeatureAccess('ai_interpretation');

// 模拟使用量
await helper.simulateUsage('searches', 80); // 80%使用量

// 验证升级提示
await helper.verifyUpgradePrompt(SubscriptionPlan.PROFESSIONAL);
```

## 🎭 Mock 数据

### 测试用户

- `freeUser` - 免费版用户
- `professionalUser` - 专业版用户
- `advancedUser` - 高级版用户
- `enterpriseUser` - 企业版用户
- `nearLimitUser` - 接近限制的用户（80%）
- `limitReachedUser` - 达到限制的用户

### 测试量表

- `phq9` - PHQ-9抑郁症筛查量表
- `gad7` - GAD-7焦虑症筛查量表

## 🔨 开发测试

### 创建新测试

1. 在 `tests/` 目录下创建新的测试文件
2. 引入测试辅助工具和fixtures
3. 编写测试用例

```typescript
import { test, expect } from '@playwright/test';
import { SubscriptionTestHelper } from '../helpers/subscription-helper';
import { mockUsers } from '../fixtures/users';

test.describe('New Feature', () => {
  test('should work correctly', async ({ page }) => {
    const helper = new SubscriptionTestHelper(page);
    await helper.loginAs(mockUsers.freeUser);

    // 测试逻辑
    await expect(page.locator('.feature')).toBeVisible();
  });
});
```

### 生成测试代码

使用 Playwright 代码生成器：

```bash
pnpm test:codegen
```

## ⚠️ 注意事项

1. **不要在生产环境运行测试** - 测试会修改数据
2. **使用测试数据库** - 确保配置了独立的测试环境
3. **清理测试数据** - 测试后清理创建的数据
4. **并行运行** - 测试应该能够并行运行

## 🔍 调试

### Visual Studio Code

1. 安装 Playwright Test for VSCode 扩展
2. 在测试文件中点击运行按钮
3. 使用断点调试

### 命令行调试

```bash
# 调试特定测试
pnpm test:debug tests/subscription/subscription-permissions.spec.ts

# 查看浏览器界面
pnpm test:headed
```

## 📊 测试报告

运行测试后会生成HTML报告：

```bash
pnpm test:report
```

报告包含：
- 测试通过/失败统计
- 失败测试的截图
- 测试执行时间
- 详细的错误信息

## 🚦 CI/CD 集成

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm exec playwright install
      - run: pnpm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📝 最佳实践

1. **使用 Page Object Model** - 将页面逻辑封装在对象中
2. **避免硬编码等待** - 使用 Playwright 的智能等待
3. **数据隔离** - 每个测试使用独立的测试数据
4. **原子性测试** - 每个测试应该独立运行
5. **清晰的断言** - 使用明确的期望值

## 🤝 贡献指南

1. 创建新分支
2. 编写测试
3. 确保所有测试通过
4. 提交PR

---

*最后更新: 2025-10-15*