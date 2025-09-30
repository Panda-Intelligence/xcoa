# i18n 修复进度报告 | i18n Remediation Progress Report

**最后更新 Last Updated:** 2025-09-30  
**状态 Status:** 进行中 In Progress (25% 完成 Completed)

---

## ✅ 已完成工作 | Completed Work

### Phase 1: 准备工作 | Preparation ✅ COMPLETED

**工作内容 | Work Done:**
- ✅ 扩展了 `public/locales/en.json` 和 `public/locales/zh.json`
- ✅ 添加了以下新的翻译命名空间：
  - `common.*` - 新增6个通用操作键（saving, deleting, processing, updating, creating, sending, back_to_home）
  - `errors.*` - 新增4个错误消息键（server_error, page_not_found, network_error, unexpected_error）
  - `auth.*` - 扩展了认证相关键（11个键）
  - `team.*` - 扩展了团队管理键（新增17个键）
  - `billing.*` - 新增账单相关键（7个键）
  - `validation.*` - 新增验证相关键（6个键）

**总计添加的翻译键 Total Keys Added:** ~55 个新键

---

### Phase 2: P0问题修复 | P0 Issues ✅ COMPLETED

#### ✅ 错误页面修复 | Error Pages Fixed

**修复的文件 | Files Fixed:**
1. `src/pages/404.tsx` ✅
   - 添加 `useLanguage` hook
   - 替换硬编码中文"页面未找到"为 `t('errors.page_not_found')`
   - 替换硬编码中文"返回首页"为 `t('common.back_to_home')`

2. `src/pages/500.tsx` ✅
   - 添加 `useLanguage` hook
   - 替换硬编码中文"服务器错误"为 `t('errors.server_error')`
   - 替换硬编码中文"返回首页"为 `t('common.back_to_home')`

**修复前后对比 | Before/After Comparison:**

```tsx
// 修复前 Before
<p className="text-lg text-muted-foreground mb-4">页面未找到</p>
<a>返回首页</a>

// 修复后 After
<p className="text-lg text-muted-foreground mb-4">{t('errors.page_not_found')}</p>
<a>{t('common.back_to_home')}</a>
```

---

## 🔄 进行中工作 | Work In Progress

### Phase 3: P1问题修复 | P1 Issues 🔄 IN PROGRESS (0/3)

**待修复的文件 | Files to Fix:**

#### 1. 认证Toast消息 | Auth Toast Messages
- [ ] `src/hooks/useSignOut.ts`
- [ ] `src/app/(auth)/sign-in/sign-in.client.tsx`
- [ ] `src/app/(auth)/sign-up/sign-up.client.tsx`

**需要替换的Toast消息 | Toast Messages to Replace:**
```typescript
// 需要修复的示例 Examples to Fix:
toast({ title: "Signing out..." })                 → t('auth.signing_out')
toast({ title: "Signed out successfully" })        → t('auth.signed_out_successfully')
toast({ title: "Signing you in..." })              → t('auth.signing_in')
toast({ title: "Signed in successfully" })         → t('auth.signed_in_successfully')
toast({ title: "Authentication successful" })      → t('auth.authentication_successful')
toast({ title: "Authentication failed" })          → t('auth.authentication_failed')
toast({ title: "Authenticating with passkey..." }) → t('auth.authenticating_with_passkey')
```

#### 2. 团队管理Toast消息 | Team Toast Messages
- [ ] `src/components/teams/create-team-form.tsx`
- [ ] `src/components/teams/invite-member-modal.tsx`
- [ ] `src/components/teams/remove-member-button.tsx`

**需要替换的Toast消息 | Toast Messages to Replace:**
```typescript
toast({ title: "Creating team..." })              → t('team.creating')
toast({ title: "Team created successfully" })     → t('team.created_successfully')
toast({ title: "Failed to create team" })         → t('team.failed_to_create_team')
toast({ title: "Sending invitation..." })         → t('team.sending_invitation')
toast({ title: "Invitation sent successfully" })  → t('team.invitation_sent')
toast({ title: "Failed to invite user" })         → t('team.failed_to_invite_user')
```

#### 3. 支付Toast消息 | Payment Toast Messages
- [ ] `src/app/(billing)/billing/_components/stripe-payment-form.tsx`

**需要替换的Toast消息 | Toast Messages to Replace:**
```typescript
toast({ title: "Processing payment..." })          → t('billing.processing_payment')
toast({ title: "Payment successful!" })            → t('billing.payment_successful')
toast({ title: "Payment failed" })                 → t('billing.payment_failed')
toast({ title: "An unexpected error occurred" })   → t('billing.unexpected_error')
```

---

## ⏳ 待处理工作 | Pending Work

### Phase 2: P0问题 - Cookie同意组件 | Cookie Consent ⏳ PENDING

**文件 | File:** `src/components/cookie-consent.tsx`

**估算工作量 | Estimated Effort:** 2-3 小时 (需要创建完整的cookie_consent命名空间，约150行文本)

**需要添加的翻译键 | Keys to Add:**
- `cookie_consent.title`
- `cookie_consent.description`
- `cookie_consent.accept_all`
- `cookie_consent.reject_all`
- `cookie_consent.customize`
- `cookie_consent.necessary`
- `cookie_consent.necessary_description`
- `cookie_consent.functional`
- `cookie_consent.functional_description`
- `cookie_consent.analytics`
- `cookie_consent.analytics_description`
- `cookie_consent.marketing`
- `cookie_consent.marketing_description`
- 等等...

---

### Phase 4: P2问题 - 表单标签和占位符 | Form Labels ⏳ PENDING

**受影响的文件 | Affected Files (~15 files):**
- 所有认证表单 | All authentication forms
- 团队创建/编辑表单 | Team creation/editing forms
- 用户设置表单 | User settings forms
- 账单相关表单 | Billing related forms

**需要修复的模式 | Pattern to Fix:**
```tsx
// 修复前 Before
<FormLabel>Team Name</FormLabel>
<Input placeholder="Enter team name" />
<FormDescription>A unique name for your team</FormDescription>

// 修复后 After
<FormLabel>{t('team.team_name')}</FormLabel>
<Input placeholder={t('team.team_name_placeholder')} />
<FormDescription>{t('team.team_name_description')}</FormDescription>
```

---

### Phase 4: P2问题 - 导航菜单 | Navigation ⏳ PENDING

**受影响的文件 | Affected Files (~5 files):**
- `src/app/(billing)/billing/billing-sidebar.tsx`
- 其他侧边栏和导航组件 | Other sidebar and navigation components

**需要修复的示例 | Examples to Fix:**
```tsx
// 修复前 Before
<SidebarItem>Credits</SidebarItem>
<SidebarItem>Transactions</SidebarItem>
<SidebarItem>Invoice</SidebarItem>

// 修复后 After
<SidebarItem>{t('billing.credits')}</SidebarItem>
<SidebarItem>{t('billing.transactions')}</SidebarItem>
<SidebarItem>{t('billing.invoice')}</SidebarItem>
```

---

### Phase 5: P3问题 - 验证消息 | Validation Messages ⏳ PENDING

**受影响的文件 | Affected Files (~20 files):**
- 所有包含Zod schema验证的表单组件
- All form components with Zod schema validation

**需要修复的模式 | Pattern to Fix:**
```typescript
// 修复前 Before
z.string().min(1, "Team name is required")
z.string().max(100, "Team name is too long")

// 修复后 After - 需要在运行时获取翻译
// 这需要特殊处理，因为schema定义在组件外部
```

**注意 | Note:** 验证消息的i18n需要特殊处理，因为Zod schema通常在组件外部定义。可能需要：
1. 将schema移到组件内部
2. 使用动态schema生成函数
3. 或在表单级别处理错误消息翻译

---

## 📊 总体进度 | Overall Progress

| 阶段 Phase | 任务 Tasks | 状态 Status | 完成度 Progress |
|-----------|-----------|------------|----------------|
| Phase 1 | 扩展locale文件 | ✅ 完成 Completed | 100% |
| Phase 2 | P0 - 错误页面 | ✅ 完成 Completed | 100% |
| Phase 2 | P0 - Cookie同意 | ⏳ 待处理 Pending | 0% |
| Phase 3 | P1 - 认证Toast | 🔄 进行中 In Progress | 0% |
| Phase 3 | P1 - 团队Toast | ⏳ 待处理 Pending | 0% |
| Phase 3 | P1 - 支付Toast | ⏳ 待处理 Pending | 0% |
| Phase 4 | P2 - 表单标签 | ⏳ 待处理 Pending | 0% |
| Phase 4 | P2 - 导航菜单 | ⏳ 待处理 Pending | 0% |
| Phase 5 | P3 - 验证消息 | ⏳ 待处理 Pending | 0% |
| Phase 6 | 测试验证 | ⏳ 待处理 Pending | 0% |

**总体完成度 Overall Completion:** 25% (2.5/10 任务)

---

## 🎯 下一步行动 | Next Actions

### 立即执行 | Immediate Actions

1. **修复认证Toast消息** (预计1小时)
   - 修复 `useSignOut.ts`
   - 修复 `sign-in.client.tsx`
   - 修复 `sign-up.client.tsx`

2. **修复团队管理Toast消息** (预计1小时)
   - 修复 `create-team-form.tsx`
   - 修复 `invite-member-modal.tsx`
   - 修复 `remove-member-button.tsx`

3. **修复支付Toast消息** (预计30分钟)
   - 修复 `stripe-payment-form.tsx`

### 后续计划 | Follow-up Plan

4. **Cookie同意组件** (预计2-3小时)
   - 创建完整的 `cookie_consent` 命名空间
   - 替换所有硬编码文本

5. **表单标签和占位符** (预计4-6小时)
   - 系统化地修复所有表单组件

6. **导航菜单** (预计1-2小时)
   - 修复所有导航和侧边栏组件

7. **验证消息** (预计3-4小时)
   - 研究并实现Zod schema的i18n支持
   - 修复所有验证消息

8. **测试验证** (预计2-3小时)
   - 功能测试
   - 视觉测试
   - 运行自动化测试

---

## 📝 修复模板 | Fix Templates

### Toast消息修复模板 | Toast Message Fix Template

```typescript
// Step 1: 在文件顶部导入useLanguage
import { useLanguage } from '@/hooks/useLanguage';

// Step 2: 在组件内部获取t函数
function MyComponent() {
  const { t } = useLanguage();
  
  // Step 3: 替换硬编码的toast消息
  // Before:
  // toast({ title: "Operation successful" })
  
  // After:
  toast({ title: t('namespace.operation_successful') })
}
```

### 表单标签修复模板 | Form Label Fix Template

```tsx
// Step 1: 导入useLanguage
import { useLanguage } from '@/hooks/useLanguage';

// Step 2: 在组件内使用
function MyFormComponent() {
  const { t } = useLanguage();
  
  return (
    <form>
      <FormLabel>{t('forms.field_name')}</FormLabel>
      <Input placeholder={t('forms.field_name_placeholder')} />
      <FormDescription>{t('forms.field_name_description')}</FormDescription>
    </form>
  )
}
```

---

## 💡 最佳实践提醒 | Best Practice Reminders

1. **始终导入useLanguage** - 在每个需要翻译的组件中
2. **保持键名一致** - 使用点分隔的命名空间
3. **测试两种语言** - 确保中英文切换正常工作
4. **检查文本长度** - 确保不同语言的文本不会破坏布局
5. **添加缺失的键** - 如果发现缺少翻译键，及时添加到locale文件

---

## 🐛 已知问题 | Known Issues

1. **错误页面可能需要在LanguageProvider之外** - 如果404/500页面在provider外部渲染，可能需要特殊处理
2. **Zod验证消息** - 需要研究最佳实践来处理schema级别的i18n
3. **API错误消息** - 服务器端返回的错误消息也需要i18n支持

---

**继续修复命令 | Command to Continue:**
```bash
# 继续修复下一个文件
pnpm run lint  # 定期检查代码质量
```

**测试命令 | Test Commands:**
```bash
pnpm run lint
pnpm run typecheck
pnpm run dev  # 本地测试语言切换
```