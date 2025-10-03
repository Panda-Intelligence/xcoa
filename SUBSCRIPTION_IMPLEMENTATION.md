# 订阅功能实现总结

## 📋 实现概览

已成功实现基于订阅计划的功能权限控制系统，将以下功能限制为 Enterprise 订阅专属：

1. **量表预览与交互式体验** (Starter+ 功能)
2. **量表版权信息查看** (Enterprise 功能)
3. **版权许可工单申请** (Enterprise 功能)  
4. **量表专业解读** (Enterprise 功能)

## 🏗️ 架构组件

### 1. 订阅计划定义 (`src/constants/plans.ts`)

定义了三个订阅层级：

```typescript
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',          // 免费版
  STARTER: 'starter',    // 专业版 ($499/月)
  ENTERPRISE: 'enterprise', // 企业版 ($1299/月)
}
```

**功能权限映射**:
- `SCALE_PREVIEW`: Starter + Enterprise
- `SCALE_INTERACTIVE`: Starter + Enterprise  
- `COPYRIGHT_VIEW`: Enterprise only
- `COPYRIGHT_TICKET`: Enterprise only
- `SCALE_INTERPRETATION`: Enterprise only

### 2. 订阅工具函数 (`src/utils/subscription.ts`)

核心函数：

- `getUserSubscription(userId)`: 获取用户当前订阅状态
- `checkFeatureAccess(userId, feature)`: 检查用户是否有权访问特定功能
- `isFeatureAvailable(plan, feature)`: 检查计划是否包含特定功能

### 3. UI 组件

#### FeatureGate (`src/components/subscription/feature-gate.tsx`)
前端功能门控组件，自动检查权限并显示升级提示：

```typescript
<FeatureGate
  feature={ENTERPRISE_FEATURES.SCALE_PREVIEW}
  featureName="量表预览与交互体验"
  featureDescription="交互式体验量表，支持多设备预览"
>
  {/* 受保护的内容 */}
</FeatureGate>
```

#### UpgradeModal (`src/components/subscription/upgrade-modal.tsx`)
精美的升级提示弹窗，展示：
- 所需订阅计划详情
- 计划功能列表
- 价格信息
- 一键跳转到计费页面

### 4. API 保护

#### API 中间件 (`src/utils/api-protection.ts`)

提供服务端权限验证：

```typescript
export async function GET(request: NextRequest, context) {
  return withFeatureAccess(
    request,
    { 
      feature: ENTERPRISE_FEATURES.SCALE_PREVIEW,
      errorMessage: '量表预览功能需要 Starter 或 Enterprise 订阅'
    },
    async (request, session) => {
      // 处理逻辑
    }
  );
}
```

#### API 端点 (`src/app/api/subscription/check-feature/route.ts`)

前端用于实时检查功能访问权限的 API。

## 📄 已修改的页面

### 前端页面 (使用 FeatureGate)

1. **量表预览页面**
   - `/src/app/(dashboard)/scales/[scaleId]/preview/page.tsx`
   - 功能: `SCALE_PREVIEW`
   
2. **版权信息页面**
   - `/src/app/(dashboard)/scales/[scaleId]/copyright/page.tsx`
   - 功能: `COPYRIGHT_VIEW`

3. **量表解读列表页**
   - `/src/app/(dashboard)/insights/interpretation/page.tsx`
   - 功能: `SCALE_INTERPRETATION`

4. **量表解读详情组件**
   - `/src/app/(dashboard)/insights/_components/interpretation-detail.tsx`
   - 功能: `SCALE_INTERPRETATION`

### 后端 API (使用 withFeatureAccess)

1. **量表预览 API**
   - `/src/app/api/scales/[scaleId]/preview/route.ts`
   - 功能: `SCALE_PREVIEW`

## 🔒 工作流程

### 用户访问受保护功能时：

1. **前端检查**:
   ```
   用户访问页面 
   → FeatureGate 调用 /api/subscription/check-feature
   → 获取用户订阅状态
   → 如果无权限，显示升级提示
   → 如果有权限，显示功能内容
   ```

2. **后端检查**:
   ```
   API 请求
   → withFeatureAccess 中间件
   → 检查 session
   → checkFeatureAccess(userId, feature)
   → 如果无权限，返回 403 + 升级信息
   → 如果有权限，执行业务逻辑
   ```

## 💾 数据库支持

使用现有的 `team` 表字段：

```sql
planId: text              -- 订阅计划 ID (free/starter/enterprise)
planExpiresAt: timestamp  -- 订阅到期时间
creditBalance: integer    -- 积分余额
```

通过 `teamMembershipTable` 关联用户和团队订阅。

## 🎨 用户体验

### 无权限时显示：

1. **卡片式提示**: 虚线边框的提示卡片，包含：
   - 锁定图标
   - "升级需求"标题
   - 功能描述
   - "查看升级选项"按钮

2. **升级弹窗**: 点击按钮后显示：
   - 渐变色背景的计划标识
   - 价格信息（月付/年付）
   - 完整功能列表（打勾图标）
   - 推荐徽章
   - "升级"和"稍后"按钮

### 响应式错误：

API 返回统一的错误格式：

```json
{
  "error": "Subscription required",
  "message": "量表预览功能需要 Starter 或 Enterprise 订阅",
  "code": "SUBSCRIPTION_REQUIRED",
  "requiredPlan": "starter",
  "feature": "scale_preview"
}
```

## ✅ 已完成的工作

- [x] 创建订阅计划常量和功能映射
- [x] 实现订阅状态查询工具函数
- [x] 创建 FeatureGate 前端组件
- [x] 创建 UpgradeModal 升级弹窗
- [x] 实现 API 订阅检查中间件
- [x] 保护量表预览页面和 API
- [x] 保护版权信息页面
- [x] 保护量表解读页面和组件
- [x] 创建订阅检查 API 端点

## 🚀 下一步建议

### 立即需要：

1. **更新多语言文件**: 添加订阅相关的翻译 key
   ```typescript
   'features.scale_preview': '量表预览与交互体验'
   'features.copyright_info': '版权信息查看'
   'features.scale_interpretation': '量表专业解读'
   ```

2. **测试流程**: 
   - 创建测试团队和订阅
   - 测试无订阅用户的访问限制
   - 测试订阅用户的正常访问
   - 测试订阅过期的处理

3. **订阅管理页面**: 在 `/billing` 页面添加：
   - 当前订阅状态显示
   - 计划比较表
   - 升级/降级功能
   - 订阅历史

### 未来优化：

1. **细粒度权限**: 
   - 每月访问次数限制
   - 功能使用统计
   - 配额管理

2. **试用期**: 
   - 7天免费试用 Enterprise 功能
   - 试用到期自动降级

3. **团队订阅管理**:
   - 团队管理员可以管理成员权限
   - 按座位计费
   - 团队使用报表

4. **优惠和促销**:
   - 优惠券系统
   - 年付折扣
   - 推荐奖励

## 📊 订阅计划对比

| 功能 | Free | Starter ($499/月) | Enterprise ($1299/月) |
|------|------|------------------|---------------------|
| 量表搜索浏览 | ✅ | ✅ | ✅ |
| 量表收藏 | ✅ | ✅ | ✅ |
| **量表预览** | ❌ | ✅ | ✅ |
| **版权信息** | ❌ | ❌ | ✅ |
| **许可工单** | ❌ | ❌ | ✅ |
| **专业解读** | ❌ | ❌ | ✅ |
| 月度积分 | 100 | 2000 | 无限 |
| 团队协作 | ❌ | ❌ | ✅ |
| API 访问 | ❌ | ❌ | ✅ |

## 🔧 维护说明

### 添加新的受保护功能：

1. 在 `src/constants/plans.ts` 中添加功能常量
2. 在 `FEATURE_PLAN_REQUIREMENTS` 中定义所需计划
3. 在页面中包裹 `<FeatureGate>`
4. 在 API 中使用 `withFeatureAccess`

### 修改计划权限：

编辑 `src/constants/plans.ts` 中的 `PLAN_FEATURES` 和 `FEATURE_PLAN_REQUIREMENTS`。

---

**实现日期**: 2025-10-03  
**实现者**: Claude Code  
**文档版本**: 1.0
