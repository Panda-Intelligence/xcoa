# 订阅功能测试指南

## 🧪 测试准备

### 1. 创建测试团队

使用 D1 数据库执行 SQL 脚本：

```bash
# 本地测试
wrangler d1 execute xcoa --local --file=scripts/create-test-subscriptions.sql

# 或使用命令行
wrangler d1 execute xcoa --local --command="INSERT INTO team ..."
```

**重要**: 在执行脚本前，替换 `your_user_id` 为实际的用户 ID。

获取用户 ID 的方法：
```sql
SELECT id, email FROM user LIMIT 10;
```

### 2. 测试账号设置

脚本会创建 4 个测试团队：

1. **免费版团队** (`free-test-team`)
   - planId: `NULL` 或 `'free'`
   - 积分: 100
   - 状态: 永久有效

2. **Starter 团队** (`starter-test-team`)
   - planId: `'starter'`
   - 积分: 2000
   - 过期时间: 30天后
   - 价格: $499/月

3. **Enterprise 团队** (`enterprise-test-team`)
   - planId: `'enterprise'`
   - 积分: 无限
   - 过期时间: 365天后
   - 价格: $1299/月

4. **已过期团队** (`expired-test-team`)
   - planId: `'enterprise'`
   - 过期时间: 7天前
   - 用途: 测试过期逻辑

## 🧪 测试场景

### 场景 1: 免费用户访问受限功能

**步骤**:
1. 使用免费版团队账号登录
2. 访问 `/scales/[scaleId]/preview`
3. 访问 `/scales/[scaleId]/copyright`
4. 访问 `/insights/interpretation`

**预期结果**:
- ✅ 看到精美的"升级提示"卡片
- ✅ 点击后显示订阅计划对比弹窗
- ✅ 显示 Starter ($499/月) 和 Enterprise ($1299/月) 选项
- ✅ 能够跳转到 `/billing/subscription`

### 场景 2: Starter 用户访问功能

**步骤**:
1. 切换到 Starter 团队
2. 访问量表预览页面 `/scales/[scaleId]/preview`
3. 访问版权信息页面 `/scales/[scaleId]/copyright`
4. 访问解读页面 `/insights/interpretation`

**预期结果**:
- ✅ 量表预览: 正常访问
- ❌ 版权信息: 显示升级到 Enterprise 提示
- ❌ 量表解读: 显示升级到 Enterprise 提示

### 场景 3: Enterprise 用户访问所有功能

**步骤**:
1. 切换到 Enterprise 团队
2. 访问所有受保护的页面

**预期结果**:
- ✅ 所有功能正常访问
- ✅ 无升级提示
- ✅ 完整功能可用

### 场景 4: 订阅过期

**步骤**:
1. 切换到已过期团队
2. 访问受保护功能

**预期结果**:
- ❌ 功能被限制
- ✅ 显示"订阅已过期"提示
- ✅ 提示续订

### 场景 5: API 级别保护

**测试 API**:
```bash
# 测试预览 API（需要 Starter+）
curl http://localhost:3000/api/scales/[scaleId]/preview

# 预期：
# - 免费用户: 403 错误
# - Starter+: 正常返回数据
```

**响应格式**:
```json
{
  "error": "Subscription required",
  "message": "量表预览功能需要 Starter 或 Enterprise 订阅",
  "code": "SUBSCRIPTION_REQUIRED",
  "requiredPlan": "starter",
  "feature": "scale_preview"
}
```

### 场景 6: 订阅管理页面

**步骤**:
1. 访问 `/billing/subscription`
2. 查看当前订阅状态
3. 点击"升级订阅"或"查看所有计划"

**预期结果**:
- ✅ 显示当前计划的详细信息
- ✅ 显示订阅状态（有效/过期）
- ✅ 显示月度积分额度
- ✅ 显示团队名称
- ✅ 功能列表清晰展示
- ✅ 计划对比表完整显示

### 场景 7: 切换团队

**步骤**:
1. 在侧边栏切换团队
2. 观察功能访问权限变化

**预期结果**:
- ✅ 切换到不同订阅级别的团队
- ✅ 功能访问权限相应变化
- ✅ 订阅管理页面显示新团队的订阅状态

## 📊 验证检查清单

### 前端验证

- [ ] FeatureGate 组件正确显示升级提示
- [ ] UpgradeModal 显示正确的计划信息和价格
- [ ] 订阅管理页面加载正确的订阅状态
- [ ] 计划对比表显示 $499 和 $1299 价格
- [ ] 月付/年付切换正常工作
- [ ] 中英文切换正常

### 后端验证

- [ ] `/api/subscription/current` 返回正确的订阅信息
- [ ] `/api/subscription/check-feature` 正确验证功能权限
- [ ] 受保护的 API 端点拒绝未授权访问
- [ ] 过期订阅被正确识别

### 数据库验证

```sql
-- 检查团队订阅状态
SELECT 
  name,
  planId,
  planExpiresAt,
  creditBalance,
  CASE 
    WHEN planExpiresAt IS NULL THEN 'permanent'
    WHEN datetime(planExpiresAt) > datetime('now') THEN 'active'
    ELSE 'expired'
  END as status
FROM team
WHERE id LIKE 'team_%test%';

-- 检查用户团队关系
SELECT 
  t.name,
  t.planId,
  tm.userId,
  tm.isActive
FROM team_membership tm
JOIN team t ON tm.teamId = t.id
WHERE tm.userId = 'your_user_id';
```

## 🐛 常见问题排查

### 问题 1: 所有功能都被限制

**原因**: 用户未加入任何团队，或团队成员关系未激活

**解决**:
```sql
-- 检查用户团队成员关系
SELECT * FROM team_membership WHERE userId = 'your_user_id';

-- 激活成员关系
UPDATE team_membership 
SET isActive = 1 
WHERE userId = 'your_user_id';
```

### 问题 2: Enterprise 功能仍然被限制

**原因**: planId 拼写错误或大小写不匹配

**解决**:
```sql
-- 检查 planId
SELECT id, name, planId FROM team;

-- 修正 planId
UPDATE team 
SET planId = 'enterprise' 
WHERE id = 'team_enterprise_test_001';
```

### 问题 3: 订阅管理页面显示"免费版"

**原因**: 
- 用户加入了多个团队，查询返回了错误的团队
- getUserSubscription 逻辑取了第一个团队

**解决**: 
确保用户只激活一个团队成员关系，或更新 `getUserSubscription` 逻辑优先选择高级订阅。

## 📝 测试报告模板

```markdown
## 订阅功能测试报告

**测试日期**: 2025-10-03
**测试人员**: [Your Name]

### 测试环境
- [ ] 本地开发环境
- [ ] 预发布环境

### 测试结果

#### 免费用户 (Free)
- [ ] 量表预览: 被限制 ✅
- [ ] 版权信息: 被限制 ✅
- [ ] 量表解读: 被限制 ✅
- [ ] 升级提示: 正常显示 ✅

#### Starter 用户 ($499/月)
- [ ] 量表预览: 正常访问 ✅
- [ ] 版权信息: 被限制 ✅
- [ ] 量表解读: 被限制 ✅

#### Enterprise 用户 ($1299/月)
- [ ] 所有功能: 正常访问 ✅

#### 订阅管理
- [ ] 显示当前计划 ✅
- [ ] 价格正确 ($499, $1299) ✅
- [ ] 计划对比表完整 ✅

### 发现的问题
1. [问题描述]
2. [问题描述]

### 建议
1. [改进建议]
2. [改进建议]
```

## 🚀 下一步

测试通过后：
1. 集成 Stripe 支付
2. 实现订阅升级/降级逻辑
3. 添加订阅续费提醒
4. 实现试用期功能
5. 添加订阅使用统计
