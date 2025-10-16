import { test, expect } from '@playwright/test';
import { SubscriptionTestHelper } from '../../helpers/subscription-helper';
import { mockUsers } from '../../fixtures/users';

test.describe('Subscription Plan Permissions', () => {
  let helper: SubscriptionTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new SubscriptionTestHelper(page);
  });

  test.describe('Free Plan', () => {
    test.beforeEach(async ({ page }) => {
      await helper.loginAs(mockUsers.freeUser);
    });

    test('should limit search to 30 per month', async ({ page }) => {
      await page.goto('/scales/search');

      // 检查搜索限制提示
      const limitText = await page.locator('text=/本月剩余搜索次数/').textContent();
      expect(limitText).toContain('30');

      // 执行搜索
      await page.fill('input[placeholder*="搜索"]', 'PHQ-9');
      await page.click('button:has-text("搜索")');

      // 验证搜索次数减少
      await page.reload();
      const updatedLimitText = await page.locator('text=/本月剩余搜索次数/').textContent();
      expect(updatedLimitText).toContain('29');
    });

    test('should limit scale views to 5 per month', async ({ page }) => {
      await page.goto('/scales/search');

      // 点击查看量表详情
      await page.click('[data-testid="scale-view-button"]');

      // 应该显示剩余查看次数
      await expect(page.locator('text=/本月剩余量表查看次数/')).toBeVisible();
    });

    test('should show watermark on PDF export', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 检查PDF导出按钮显示水印标记
      const exportButton = page.locator('button:has-text("PDF导出")');
      await expect(exportButton).toContainText('带水印');
    });

    test('should block AI interpretation access', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 点击AI解读按钮
      await page.click('button:has-text("AI解读")');

      // 应该显示升级提示
      await expect(page.locator('text=/AI解读功能需要专业版/')).toBeVisible();
    });

    test('should block case study access', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 点击临床案例标签
      await page.click('button[role="tab"]:has-text("临床案例")');

      // 应该显示升级提示
      await expect(page.locator('text=/升级到专业版，查看真实临床案例/')).toBeVisible();
    });

    test('should block data export', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 尝试导出数据
      await page.click('button:has-text("数据导出")');

      // 应该显示权限错误
      await expect(page.locator('text=/数据导出功能需要专业版/')).toBeVisible();
    });
  });

  test.describe('Professional Plan', () => {
    test.beforeEach(async ({ page }) => {
      await helper.loginAs(mockUsers.professionalUser);
    });

    test('should have unlimited search', async ({ page }) => {
      await page.goto('/scales/search');

      // 不应该显示搜索限制
      await expect(page.locator('text=/本月剩余搜索次数/')).not.toBeVisible();

      // 可以自由搜索
      await page.fill('input[placeholder*="搜索"]', 'GAD-7');
      await page.click('button:has-text("搜索")');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    test('should limit scale views to 100 per month', async ({ page }) => {
      await page.goto('/scales/search');

      // 访问量表详情
      await page.click('[data-testid="scale-view-button"]');

      // 检查是否有查看限制提示（当接近限制时）
      const usage = await helper.getUsageStats();
      if (usage.scaleViews.used > 80) {
        await expect(page.locator('text=/本月剩余量表查看次数/')).toBeVisible();
      }
    });

    test('should allow AI interpretation with limit', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 点击AI解读按钮
      await page.click('button:has-text("AI解读")');

      // 应该能访问AI解读页面
      await expect(page).toHaveURL(/\/insights\/interpretation/);

      // 检查使用量限制（20次/月）
      const aiUsage = await page.locator('[data-testid="ai-usage-indicator"]').textContent();
      expect(aiUsage).toMatch(/\d+\s*\/\s*20/);
    });

    test('should export PDF without watermark', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // PDF导出按钮不应显示水印标记
      const exportButton = page.locator('button:has-text("PDF导出")');
      await expect(exportButton).not.toContainText('带水印');
    });

    test('should allow case study access', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 点击临床案例标签
      await page.click('button[role="tab"]:has-text("临床案例")');

      // 应该显示案例内容而非升级提示
      await expect(page.locator('[data-testid="clinical-cases"]')).toBeVisible();
    });

    test('should block API access', async ({ page }) => {
      // 尝试访问API
      const response = await page.request.post('/api/scales/search', {
        data: { query: 'test' }
      });

      // 专业版不应有API访问权限
      expect(response.status()).toBe(403);
    });
  });

  test.describe('Advanced Plan', () => {
    test.beforeEach(async ({ page }) => {
      await helper.loginAs(mockUsers.advancedUser);
    });

    test('should have unlimited scale views', async ({ page }) => {
      await page.goto('/scales/search');

      // 访问多个量表，不应有限制
      for (let i = 0; i < 5; i++) {
        await page.click(`[data-testid="scale-view-button-${i}"]`);
        await page.goBack();
      }

      // 不应显示查看限制警告
      await expect(page.locator('text=/本月剩余量表查看次数/')).not.toBeVisible();
    });

    test('should have 100 AI interpretations per month', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 点击AI解读
      await page.click('button:has-text("AI解读")');

      // 检查使用量限制（100次/月）
      const aiUsage = await page.locator('[data-testid="ai-usage-indicator"]').textContent();
      expect(aiUsage).toMatch(/\d+\s*\/\s*100/);
    });

    test('should allow API access with limit', async ({ page }) => {
      // 发送API请求
      const response = await page.request.post('/api/scales/search', {
        data: { query: 'depression' },
        headers: {
          'Authorization': `Bearer ${mockUsers.advancedUser.apiKey}`
        }
      });

      expect(response.status()).toBe(200);

      // 检查API使用量限制头
      const remainingCalls = response.headers()['x-ratelimit-remaining'];
      expect(parseInt(remainingCalls)).toBeLessThanOrEqual(10000);
    });

    test('should support team collaboration up to 5 members', async ({ page }) => {
      await page.goto('/teams');

      // 检查团队成员限制
      const teamLimit = await page.locator('[data-testid="team-limit"]').textContent();
      expect(teamLimit).toContain('5');
    });
  });

  test.describe('Enterprise Plan', () => {
    test.beforeEach(async ({ page }) => {
      await helper.loginAs(mockUsers.enterpriseUser);
    });

    test('should have unlimited everything', async ({ page }) => {
      await page.goto('/scales/search');

      // 不应显示任何使用限制
      await expect(page.locator('text=/剩余/')).not.toBeVisible();
      await expect(page.locator('text=/限制/')).not.toBeVisible();
    });

    test('should have copyright assistance', async ({ page }) => {
      await page.goto('/scales/scale_phq9');

      // 点击版权申请
      await page.click('button:has-text("申请版权授权")');

      // 应该有专属的版权协助功能
      await expect(page.locator('[data-testid="copyright-assistance"]')).toBeVisible();
      await expect(page.locator('text=/专属客服将协助您/')).toBeVisible();
    });

    test('should have unlimited API access', async ({ page }) => {
      // 连续发送多个API请求
      for (let i = 0; i < 10; i++) {
        const response = await page.request.post('/api/scales/search', {
          data: { query: `test-${i}` },
          headers: {
            'Authorization': `Bearer ${mockUsers.enterpriseUser.apiKey}`
          }
        });

        expect(response.status()).toBe(200);
        // 不应有速率限制
        expect(response.headers()['x-ratelimit-remaining']).toBeUndefined();
      }
    });

    test('should support unlimited team members', async ({ page }) => {
      await page.goto('/teams');

      // 不应显示团队成员限制
      await expect(page.locator('text=/无限团队成员/')).toBeVisible();
    });
  });

  test.describe('Usage Limits and Warnings', () => {
    test('should show warning when approaching limit (80%)', async ({ page }) => {
      // 模拟接近限制的用户
      await helper.loginAs(mockUsers.nearLimitUser);
      await page.goto('/scales/search');

      // 应该显示警告
      await expect(page.locator('.text-orange-600')).toContainText('即将达到使用上限');
    });

    test('should block access when limit reached', async ({ page }) => {
      // 模拟达到限制的用户
      await helper.loginAs(mockUsers.limitReachedUser);
      await page.goto('/scales/search');

      // 搜索按钮应该被禁用
      await expect(page.locator('button:has-text("搜索")')).toBeDisabled();

      // 显示升级提示
      await expect(page.locator('text=/已达到使用上限/')).toBeVisible();
    });

    test('should redirect to pricing page on upgrade click', async ({ page }) => {
      await helper.loginAs(mockUsers.freeUser);
      await page.goto('/scales/scale_phq9');

      // 点击升级按钮
      await page.click('button:has-text("查看升级选项")');

      // 应该跳转到定价页面
      await expect(page).toHaveURL('/pricing');
    });
  });
});

test.describe('Subscription Upgrade Flow', () => {
  test('should complete upgrade from free to professional', async ({ page }) => {
    const helper = new SubscriptionTestHelper(page);
    await helper.loginAs(mockUsers.freeUser);

    // 访问定价页面
    await page.goto('/pricing');

    // 选择专业版
    await page.click('[data-testid="plan-professional"] button:has-text("升级到此计划")');

    // 应该跳转到Stripe Checkout（在测试环境中模拟）
    await expect(page).toHaveURL(/checkout\.stripe\.com|\/checkout/);

    // 模拟支付成功回调
    await page.goto('/api/stripe/webhook', {
      method: 'POST',
      data: {
        type: 'checkout.session.completed',
        data: {
          object: {
            customer_email: mockUsers.freeUser.email,
            subscription: 'sub_test_professional'
          }
        }
      }
    });

    // 验证升级成功
    await page.goto('/scales/search');
    await expect(page.locator('text=/本月剩余搜索次数/')).not.toBeVisible();
  });

  test('should handle subscription cancellation', async ({ page }) => {
    const helper = new SubscriptionTestHelper(page);
    await helper.loginAs(mockUsers.professionalUser);

    // 访问账户设置
    await page.goto('/settings/billing');

    // 点击取消订阅
    await page.click('button:has-text("取消订阅")');

    // 确认取消
    await page.click('button:has-text("确认取消")');

    // 应该显示取消成功消息
    await expect(page.locator('text=/订阅将在当前计费周期结束后取消/')).toBeVisible();
  });
});