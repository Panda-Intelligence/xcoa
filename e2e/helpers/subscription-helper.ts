import { Page } from '@playwright/test';

// 复制 SubscriptionPlan 枚举定义，避免导入生产代码
export enum SubscriptionPlan {
  FREE = 'free',
  PROFESSIONAL = 'professional',
  ADVANCED = 'advanced',
  ENTERPRISE = 'enterprise'
}

interface MockUser {
  email: string;
  password: string;
  plan: SubscriptionPlan;
  apiKey?: string;
  usage?: {
    searches: number;
    scaleViews: number;
    aiInterpretations: number;
    apiCalls: number;
  };
}

export class SubscriptionTestHelper {
  constructor(private page: Page) {}

  /**
   * 登录为指定用户
   */
  async loginAs(user: MockUser) {
    await this.page.goto('/sign-in');
    await this.page.fill('input[name="email"]', user.email);
    await this.page.fill('input[name="password"]', user.password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/dashboard');
  }

  /**
   * 获取当前用户的使用量统计
   */
  async getUsageStats() {
    const response = await this.page.request.get('/api/subscription/status');
    const data = await response.json();
    return data.usage;
  }

  /**
   * 模拟使用量达到特定百分比
   */
  async simulateUsage(feature: string, percentage: number) {
    // 在测试环境中，可以通过特殊的API端点来设置使用量
    await this.page.request.post('/api/test/set-usage', {
      data: {
        feature,
        percentage
      }
    });
  }

  /**
   * 检查功能是否可访问
   */
  async checkFeatureAccess(feature: string): Promise<boolean> {
    const response = await this.page.request.post('/api/subscription/check-access', {
      data: { feature }
    });
    const result = await response.json();
    return result.allowed;
  }

  /**
   * 获取剩余使用量
   */
  async getRemainingUsage(feature: string): Promise<number | null> {
    const stats = await this.getUsageStats();
    const usage = stats[feature];
    if (usage.limit === null) return null;
    return usage.limit - usage.used;
  }

  /**
   * 清理测试数据
   */
  async cleanup() {
    // 清理测试期间创建的数据
    await this.page.request.post('/api/test/cleanup');
  }

  /**
   * 模拟时间流逝（用于测试月度重置）
   */
  async advanceTime(days: number) {
    await this.page.request.post('/api/test/advance-time', {
      data: { days }
    });
  }

  /**
   * 设置用户订阅计划（仅测试环境）
   */
  async setUserPlan(userId: string, plan: SubscriptionPlan) {
    await this.page.request.post('/api/test/set-plan', {
      data: { userId, plan }
    });
  }

  /**
   * 验证升级提示显示
   */
  async verifyUpgradePrompt(requiredPlan: SubscriptionPlan) {
    await this.page.waitForSelector('[data-testid="upgrade-prompt"]');
    const promptText = await this.page.textContent('[data-testid="upgrade-prompt"]');
    return promptText?.includes(requiredPlan);
  }

  /**
   * 模拟Stripe webhook事件
   */
  async simulateStripeWebhook(eventType: string, data: any) {
    const response = await this.page.request.post('/api/stripe/webhook', {
      headers: {
        'stripe-signature': 'test_signature'
      },
      data: {
        type: eventType,
        data: {
          object: data
        }
      }
    });
    return response;
  }

  /**
   * 获取当前页面的所有toast通知
   */
  async getToastMessages(): Promise<string[]> {
    const toasts = await this.page.locator('[data-sonner-toast]').all();
    const messages: string[] = [];
    for (const toast of toasts) {
      const text = await toast.textContent();
      if (text) messages.push(text);
    }
    return messages;
  }

  /**
   * 等待并关闭所有toast通知
   */
  async dismissAllToasts() {
    const closeButtons = await this.page.locator('[data-sonner-toast] button[aria-label="Close"]').all();
    for (const button of closeButtons) {
      await button.click();
    }
  }

  /**
   * 验证使用量指示器
   */
  async verifyUsageIndicator(feature: string, expected: { used: number; limit: number | null }) {
    const indicator = this.page.locator(`[data-testid="usage-${feature}"]`);
    const text = await indicator.textContent();

    if (expected.limit === null) {
      return text?.includes('无限制');
    } else {
      return text?.includes(`${expected.used} / ${expected.limit}`);
    }
  }

  /**
   * 模拟批量操作以测试限制
   */
  async performBulkOperations(operation: string, count: number) {
    const results = [];
    for (let i = 0; i < count; i++) {
      const success = await this.checkFeatureAccess(operation);
      results.push(success);
      if (!success) break;
    }
    return results;
  }
}