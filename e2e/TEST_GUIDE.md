# E2E 测试说明

## ✅ 测试已完成配置

E2E测试已经正确配置在 `/e2e` 目录中，使用 Playwright 测试框架。

## 📁 测试结构

```
e2e/
├── tests/
│   └── subscription.spec.ts         # 订阅权限测试
├── helpers/
│   └── subscription-helper.ts       # 测试辅助工具
├── fixtures/
│   └── users.ts                     # 测试数据
└── README.md                        # 测试文档
```

## 🚀 运行测试

### 前置要求

1. 确保开发服务器正在运行：
```bash
pnpm dev
```

2. 安装测试浏览器（只需运行一次）：
```bash
pnpm exec playwright install chromium
```

### 运行测试

```bash
# 运行所有测试
pnpm exec playwright test

# 运行订阅测试
pnpm exec playwright test e2e/tests/subscription.spec.ts

# 带界面运行（调试用）
pnpm exec playwright test --headed

# 只用Chrome运行
pnpm exec playwright test --project=chromium

# 查看测试报告
pnpm exec playwright show-report
```

## ⚠️ 已知问题和解决方案

### 1. Cookie同意弹窗问题 ✅ 已解决
~~测试中可能会遇到cookie同意弹窗挡住操作元素的问题。~~

**解决方案已实施：**
在测试中通过预设cookie来跳过同意弹窗：
```typescript
async function loginAs(page: Page, user: typeof mockUsers.freeUser) {
  // 设置cookie以跳过cookie同意弹窗
  await page.context().addCookies([
    {
      name: 'gdpr-consent',
      value: 'true',
      domain: 'localhost',
      path: '/'
    }
  ]);

  await page.goto('/sign-in');
  // ... 继续登录流程
}
```

### 2. 测试用户数据
测试需要在数据库中预先创建测试用户。可以通过以下方式：

1. 创建测试数据种子脚本
2. 使用测试专用数据库
3. 在测试前后清理数据

**注意：** 当前测试会在登录失败时（测试用户不存在）直接导航到目标页面继续测试。

### 3. 环境隔离
建议使用独立的测试环境：

```env
# .env.test
DATABASE_URL=test.db
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 📋 测试覆盖内容

### 当前实现的测试

1. **免费版权限测试**
   - 搜索次数限制检查
   - AI解读功能限制
   - 量表查看限制

2. **专业版权限测试**
   - 无限搜索验证
   - AI解读访问权限

3. **升级流程测试**
   - 限制提示显示
   - 升级按钮跳转

## 🔧 测试最佳实践

1. **数据隔离**: 每个测试使用独立的测试数据
2. **清理机制**: 测试后清理创建的数据
3. **等待策略**: 使用Playwright的智能等待而非硬编码等待
4. **断言明确**: 使用清晰的期望值
5. **错误处理**: 妥善处理测试中的异常情况

## 🚦 CI/CD 集成

可以在GitHub Actions中运行测试：

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
      - run: pnpm exec playwright install --with-deps
      - run: pnpm dev &
      - run: sleep 5
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📝 下一步改进

1. **完善测试覆盖**：添加更多边界情况测试
2. **Mock数据**：使用Mock API避免依赖真实后端
3. **并行化**：优化测试执行速度
4. **报告优化**：集成更详细的测试报告
5. **自动化部署**：测试通过后自动部署

---

*注意：测试代码与生产代码完全隔离，不会影响生产环境。*