# i18n 修复计划 | i18n Remediation Plan

## 📊 项目i18n现状分析 | Project i18n Status Analysis

### 检查时间 | Inspection Date
2025-09-30

### 总体情况 | Overall Status
项目已建立基本的i18n框架，使用 `useLanguage` hook 和位于 `/public/locales/` 的语言文件（en.json, zh.json）。但仍存在大量硬编码的中英文文本违反了i18n最佳实践。

The project has established a basic i18n framework using the `useLanguage` hook and language files in `/public/locales/` (en.json, zh.json). However, there are still numerous hardcoded Chinese and English texts that violate i18n best practices.

### 统计数据 | Statistics
- **受影响文件总数 | Total Affected Files**: ~50+ 个文件
- **关键问题（中文硬编码）| Critical Issues (Chinese hardcoded)**: 6 个文件
- **高优先级问题 | High Priority Issues**: ~30 处硬编码英文UI文本
- **中优先级问题 | Medium Priority Issues**: ~40 处导航、表单、按钮标签
- **低优先级问题 | Lower Priority Issues**: ~60 处验证消息、错误消息、静态内容

---

## 🎯 修复优先级 | Remediation Priority

### 第一优先级 (P0 - 立即修复 | Immediate Fix)

#### 1. 错误页面中的硬编码中文 | Hardcoded Chinese in Error Pages
**文件 | Files:**
- `src/pages/500.tsx`
- `src/pages/404.tsx`

**问题 | Issues:**
```tsx
// 当前代码 | Current Code
<p className="text-lg text-muted-foreground mb-4">服务器错误</p>
<a>返回首页</a>

// 应该使用 | Should Use
<p className="text-lg text-muted-foreground mb-4">{t('errors.server_error')}</p>
<a>{t('common.back_to_home')}</a>
```

**需要添加的翻译键 | Translation Keys to Add:**
```json
// en.json
{
  "errors": {
    "server_error": "Server Error",
    "page_not_found": "Page Not Found"
  },
  "common": {
    "back_to_home": "Back to Home"
  }
}

// zh.json
{
  "errors": {
    "server_error": "服务器错误",
    "page_not_found": "页面未找到"
  },
  "common": {
    "back_to_home": "返回首页"
  }
}
```

#### 2. Cookie同意对话框 | Cookie Consent Dialog
**文件 | File:** `src/components/cookie-consent.tsx`

**问题 | Issues:**
整个组件包含大量硬编码的中文文本（约150行），包括：
- Cookie类型说明
- 隐私政策描述
- 按钮标签
- 开关标签

Entire component contains extensive hardcoded Chinese text (~150 lines), including:
- Cookie type descriptions
- Privacy policy descriptions
- Button labels
- Switch labels

**建议 | Recommendation:**
创建专门的 `cookie_consent` 命名空间，包含所有相关文本。

Create a dedicated `cookie_consent` namespace with all related text.

---

### 第二优先级 (P1 - 高优先级 | High Priority)

#### 3. 认证流程的Toast消息 | Authentication Toast Messages
**文件 | Files:**
- `src/app/(auth)/sign-in/sign-in.client.tsx`
- `src/app/(auth)/sign-up/sign-up.client.tsx`
- `src/hooks/useSignOut.ts`

**问题示例 | Example Issues:**
```typescript
// 当前代码 | Current Code
toast({ title: "Signed in successfully" })
toast({ title: "Authentication failed" })
toast({ title: "Signing you in..." })

// 应该使用 | Should Use
toast({ title: t('auth.signed_in_successfully') })
toast({ title: t('auth.authentication_failed') })
toast({ title: t('auth.signing_in') })
```

**需要添加的翻译键 | Translation Keys to Add:**
```json
{
  "auth": {
    "signing_in": "Signing you in...",
    "signed_in_successfully": "Signed in successfully",
    "authentication_successful": "Authentication successful",
    "authentication_failed": "Authentication failed",
    "authenticating_with_passkey": "Authenticating with passkey...",
    "signing_out": "Signing out...",
    "signed_out_successfully": "Signed out successfully"
  }
}
```

#### 4. 团队管理Toast消息 | Team Management Toast Messages
**文件 | Files:**
- `src/components/teams/create-team-form.tsx`
- `src/components/teams/invite-member-modal.tsx`
- `src/components/teams/remove-member-button.tsx`

**问题示例 | Example Issues:**
```typescript
// 当前代码 | Current Code
toast({ title: "Team created successfully" })
toast({ title: "Failed to create team" })
toast({ title: "Invitation sent successfully" })

// 应该使用 | Should Use
toast({ title: t('team.created_successfully') })
toast({ title: t('team.failed_to_create') })
toast({ title: t('team.invitation_sent') })
```

#### 5. 支付相关Toast消息 | Payment Toast Messages
**文件 | File:** `src/app/(billing)/billing/_components/stripe-payment-form.tsx`

**问题示例 | Example Issues:**
```typescript
// 当前代码 | Current Code
toast({ title: "Payment successful!" })
toast({ title: "Payment failed" })

// 应该使用 | Should Use
toast({ title: t('billing.payment_successful') })
toast({ title: t('billing.payment_failed') })
```

---

### 第三优先级 (P2 - 中优先级 | Medium Priority)

#### 6. 表单标签和占位符 | Form Labels and Placeholders

**受影响组件 | Affected Components:**
- 所有认证表单 | All authentication forms
- 团队创建/编辑表单 | Team creation/editing forms
- 用户设置表单 | User settings forms
- 账单相关表单 | Billing related forms

**问题模式 | Issue Pattern:**
```tsx
// 当前代码 | Current Code
<FormLabel>Team Name</FormLabel>
<Input placeholder="Enter team name" />
<FormDescription>A unique name for your team</FormDescription>

// 应该使用 | Should Use
<FormLabel>{t('forms.team_name')}</FormLabel>
<Input placeholder={t('forms.team_name_placeholder')} />
<FormDescription>{t('forms.team_name_description')}</FormDescription>
```

**建议创建的命名空间 | Suggested Namespace:**
```json
{
  "forms": {
    "team_name": "Team Name",
    "team_name_placeholder": "Enter team name",
    "team_name_description": "A unique name for your team",
    "email_placeholder": "Email address",
    "password_placeholder": "Password",
    "first_name": "First Name",
    "last_name": "Last Name",
    "description": "Description"
  }
}
```

#### 7. 导航和菜单项 | Navigation and Menu Items

**文件 | Files:**
- `src/app/(billing)/billing/billing-sidebar.tsx`
- 各种侧边栏和导航组件 | Various sidebar and navigation components

**问题示例 | Example Issues:**
```tsx
// 当前代码 | Current Code
<SidebarItem>Credits</SidebarItem>
<SidebarItem>Transactions</SidebarItem>
<SidebarItem>Invoice</SidebarItem>

// 应该使用 | Should Use
<SidebarItem>{t('navigation.credits')}</SidebarItem>
<SidebarItem>{t('navigation.transactions')}</SidebarItem>
<SidebarItem>{t('navigation.invoice')}</SidebarItem>
```

#### 8. 页面标题和描述 | Page Titles and Descriptions

**问题 | Issues:**
- Metadata titles and descriptions
- Breadcrumb labels
- Page headings

**建议 | Recommendation:**
为每个页面创建专门的元数据键。

Create dedicated metadata keys for each page.

---

### 第四优先级 (P3 - 低优先级 | Lower Priority)

#### 9. 表单验证消息 | Form Validation Messages

**问题示例 | Example Issues:**
```typescript
// 当前代码 | Current Code
z.string().min(1, "Team name is required")
z.string().max(100, "Team name is too long")

// 应该使用 | Should Use
z.string().min(1, t('validation.team_name_required'))
z.string().max(100, t('validation.team_name_too_long'))
```

#### 10. API错误消息 | API Error Messages

**受影响的API路由 | Affected API Routes:**
- 所有返回用户可见错误的API路由
- All API routes returning user-visible errors

**建议 | Recommendation:**
在服务器端也支持i18n，或在客户端统一处理错误消息翻译。

Support i18n on server side, or handle error message translation uniformly on client side.

---

## 🛠️ 实施步骤 | Implementation Steps

### 阶段1：准备工作 | Phase 1: Preparation

1. **备份当前代码 | Backup Current Code**
   ```bash
   git checkout -b feature/i18n-remediation
   ```

2. **扩展locale文件 | Extend Locale Files**
   - 为所有发现的硬编码文本添加翻译键
   - Add translation keys for all discovered hardcoded text
   
3. **创建迁移检查清单 | Create Migration Checklist**
   - 使用此文档作为基础
   - Use this document as the foundation

### 阶段2：关键修复 | Phase 2: Critical Fixes

**目标 | Goal:** 修复所有P0优先级问题 | Fix all P0 priority issues

1. 修复错误页面 (404.tsx, 500.tsx)
   - Add i18n imports
   - Replace hardcoded text with translation keys
   
2. 修复cookie-consent组件
   - Create comprehensive `cookie_consent` namespace
   - Replace all hardcoded Chinese text

**预计时间 | Estimated Time:** 2-3 小时 | hours

### 阶段3：高优先级修复 | Phase 3: High Priority Fixes

**目标 | Goal:** 修复所有P1优先级问题 | Fix all P1 priority issues

1. 修复所有认证相关Toast消息
2. 修复所有团队管理Toast消息
3. 修复所有支付相关Toast消息

**预计时间 | Estimated Time:** 4-5 小时 | hours

### 阶段4：中优先级修复 | Phase 4: Medium Priority Fixes

**目标 | Goal:** 修复所有P2优先级问题 | Fix all P2 priority issues

1. 修复所有表单标签和占位符
2. 修复导航和菜单项
3. 修复页面标题和描述

**预计时间 | Estimated Time:** 6-8 小时 | hours

### 阶段5：低优先级修复 | Phase 5: Lower Priority Fixes

**目标 | Goal:** 修复所有P3优先级问题 | Fix all P3 priority issues

1. 修复表单验证消息
2. 修复API错误消息
3. 修复其他静态内容

**预计时间 | Estimated Time:** 4-6 小时 | hours

### 阶段6：测试和验证 | Phase 6: Testing and Validation

1. **功能测试 | Functional Testing**
   - 测试所有修改过的组件
   - Test all modified components
   - 验证中英文切换是否正常
   - Verify Chinese/English switching works correctly

2. **视觉测试 | Visual Testing**
   - 检查文本溢出
   - Check for text overflow
   - 验证布局一致性
   - Verify layout consistency

3. **运行自动化测试 | Run Automated Tests**
   ```bash
   pnpm run lint
   pnpm run typecheck
   pnpm run test
   ```

**预计时间 | Estimated Time:** 2-3 小时 | hours

---

## 📋 需要添加的翻译键清单 | Translation Keys to Add

### 1. 通用 | Common
```json
{
  "common": {
    "back_to_home": "返回首页 | Back to Home",
    "loading_text": "加载中... | Loading...",
    "saving": "保存中... | Saving...",
    "deleting": "删除中... | Deleting...",
    "processing": "处理中... | Processing..."
  }
}
```

### 2. 错误 | Errors
```json
{
  "errors": {
    "server_error": "服务器错误 | Server Error",
    "page_not_found": "页面未找到 | Page Not Found",
    "network_error": "网络错误 | Network Error",
    "unexpected_error": "发生意外错误 | An unexpected error occurred"
  }
}
```

### 3. 认证 | Authentication
```json
{
  "auth": {
    "signing_in": "登录中... | Signing you in...",
    "signed_in_successfully": "登录成功 | Signed in successfully",
    "authentication_successful": "认证成功 | Authentication successful",
    "authentication_failed": "认证失败 | Authentication failed",
    "authenticating_with_passkey": "使用通行密钥认证中... | Authenticating with passkey...",
    "signing_out": "登出中... | Signing out...",
    "signed_out_successfully": "已成功登出 | Signed out successfully",
    "signing_up": "注册中... | Signing up...",
    "signed_up_successfully": "注册成功 | Signed up successfully"
  }
}
```

### 4. 团队管理 | Team Management
```json
{
  "team": {
    "creating": "创建团队中... | Creating team...",
    "created_successfully": "团队创建成功 | Team created successfully",
    "failed_to_create": "创建团队失败 | Failed to create team",
    "updating": "更新团队中... | Updating team...",
    "updated_successfully": "团队更新成功 | Team updated successfully",
    "failed_to_update": "更新团队失败 | Failed to update team",
    "sending_invitation": "发送邀请中... | Sending invitation...",
    "invitation_sent": "邀请已发送 | Invitation sent successfully",
    "failed_to_invite": "邀请发送失败 | Failed to invite user",
    "removing_member": "移除成员中... | Removing member...",
    "member_removed": "成员已移除 | Member removed successfully",
    "failed_to_remove": "移除成员失败 | Failed to remove member"
  }
}
```

### 5. 账单 | Billing
```json
{
  "billing": {
    "payment_successful": "支付成功！ | Payment successful!",
    "payment_failed": "支付失败 | Payment failed",
    "processing_payment": "处理支付中... | Processing payment...",
    "unexpected_error": "发生意外错误 | An unexpected error occurred"
  }
}
```

### 6. 表单 | Forms
```json
{
  "forms": {
    "team_name": "团队名称 | Team Name",
    "team_name_placeholder": "输入团队名称 | Enter team name",
    "team_name_description": "团队的唯一名称 | A unique name for your team",
    "description": "描述 | Description",
    "description_placeholder": "输入描述 | Enter description",
    "email_placeholder": "邮箱地址 | Email address",
    "password_placeholder": "密码 | Password",
    "first_name": "名字 | First Name",
    "first_name_placeholder": "输入名字 | Enter first name",
    "last_name": "姓氏 | Last Name",
    "last_name_placeholder": "输入姓氏 | Enter last name"
  }
}
```

### 7. 验证 | Validation
```json
{
  "validation": {
    "required": "此字段为必填项 | This field is required",
    "team_name_required": "团队名称为必填项 | Team name is required",
    "team_name_too_long": "团队名称过长 | Team name is too long",
    "description_too_long": "描述过长 | Description is too long",
    "invalid_url": "无效的URL | Invalid URL",
    "url_too_long": "URL过长 | URL is too long",
    "invalid_email": "无效的邮箱地址 | Invalid email address",
    "password_too_short": "密码过短 | Password is too short"
  }
}
```

### 8. Cookie同意 | Cookie Consent
```json
{
  "cookie_consent": {
    "title": "Cookie设置 | Cookie Settings",
    "description": "我们使用Cookie... | We use cookies...",
    "accept_all": "接受全部 | Accept All",
    "reject_all": "拒绝全部 | Reject All",
    "customize": "自定义设置 | Customize Settings",
    "necessary": "必要Cookie | Necessary Cookies",
    "necessary_description": "这些Cookie... | These cookies...",
    "functional": "功能Cookie | Functional Cookies",
    "functional_description": "这些Cookie... | These cookies...",
    "analytics": "分析Cookie | Analytics Cookies",
    "analytics_description": "这些Cookie... | These cookies...",
    "marketing": "营销Cookie | Marketing Cookies",
    "marketing_description": "这些Cookie... | These cookies..."
  }
}
```

---

## 🎨 最佳实践建议 | Best Practice Recommendations

### 1. 命名约定 | Naming Convention
- 使用点分隔的命名空间：`namespace.category.key`
- Use dot-separated namespaces: `namespace.category.key`
- 保持键名简洁但有描述性
- Keep key names concise but descriptive

### 2. 组织结构 | Organization Structure
```
common.*          - 通用文本 | Common text
errors.*          - 错误消息 | Error messages
auth.*            - 认证相关 | Authentication
team.*            - 团队管理 | Team management
forms.*           - 表单标签 | Form labels
validation.*      - 验证消息 | Validation messages
navigation.*      - 导航项 | Navigation items
```

### 3. 动态内容处理 | Dynamic Content Handling
```typescript
// 带参数的翻译 | Translation with parameters
t('greeting', { name: 'John' })

// 在locale文件中 | In locale file
{
  "greeting": "Hello, {{name}}!"
}
```

### 4. 复数处理 | Plural Handling
考虑为复数形式创建单独的键，或使用支持复数的i18n库。

Consider creating separate keys for plural forms or using an i18n library that supports pluralization.

---

## ✅ 验收标准 | Acceptance Criteria

修复完成后，项目应满足以下标准：

Upon completion, the project should meet the following criteria:

1. ✅ 所有组件中没有硬编码的中文字符
   No hardcoded Chinese characters in any components
   
2. ✅ 所有用户可见的英文文本都使用i18n键
   All user-visible English text uses i18n keys
   
3. ✅ 中英文切换功能正常工作
   Chinese/English switching works correctly
   
4. ✅ 所有翻译键都有对应的中英文翻译
   All translation keys have corresponding Chinese and English translations
   
5. ✅ 没有遗漏的翻译（显示键名而不是实际文本）
   No missing translations (showing key names instead of actual text)
   
6. ✅ 通过所有lint和typecheck检查
   Passes all lint and typecheck validations
   
7. ✅ 功能测试通过
   Functional tests pass

---

## 📝 进度跟踪 | Progress Tracking

| 优先级 Priority | 分类 Category | 文件数 Files | 状态 Status | 完成日期 Completion |
|----------------|---------------|-------------|-------------|-------------------|
| P0 | 错误页面 Error Pages | 2 | ⏳ 待处理 Pending | - |
| P0 | Cookie同意 Cookie Consent | 1 | ⏳ 待处理 Pending | - |
| P1 | 认证Toast Auth Toasts | 3 | ⏳ 待处理 Pending | - |
| P1 | 团队Toast Team Toasts | 3 | ⏳ 待处理 Pending | - |
| P1 | 支付Toast Billing Toasts | 1 | ⏳ 待处理 Pending | - |
| P2 | 表单标签 Form Labels | ~15 | ⏳ 待处理 Pending | - |
| P2 | 导航菜单 Navigation | ~5 | ⏳ 待处理 Pending | - |
| P2 | 页面标题 Page Titles | ~10 | ⏳ 待处理 Pending | - |
| P3 | 验证消息 Validation | ~20 | ⏳ 待处理 Pending | - |
| P3 | API错误 API Errors | ~10 | ⏳ 待处理 Pending | - |

**图例 Legend:**
- ⏳ 待处理 Pending
- 🔄 进行中 In Progress
- ✅ 已完成 Completed
- ❌ 已跳过 Skipped

---

## 🔗 相关资源 | Related Resources

- 项目i18n Hook: `src/hooks/useLanguage.tsx`
- 英文翻译文件: `public/locales/en.json`
- 中文翻译文件: `public/locales/zh.json`
- 语言切换组件: 相关导航组件

---

**最后更新 Last Updated:** 2025-09-30
**创建者 Created By:** Claude Code Assistant
**版本 Version:** 1.0