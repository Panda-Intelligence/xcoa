# xCOA - 专业量表管理平台

[![Deploy Status](https://img.shields.io/badge/deploy-cloudflare-orange)](https://xcoa.pro)

xCOA 是一个专业的心理量表管理和授权平台，基于 Cloudflare Workers 构建，为科研人员和临床医生提供量表搜索、授权申请和数据分析服务。

## 🚀 核心功能

### 🔐 认证与授权
- 📧 邮箱/密码注册登录
- 🔑 WebAuthn/Passkey 认证
- 🌐 Google OAuth/SSO 集成
- 🔄 忘记密码流程
- ✉️ 邮箱验证
- 🗝️ Session 管理（Cloudflare KV）
- 🤖 Turnstile 验证码
- ⚡ API 限流保护

### 💾 量表管理
- 🔍 量表搜索和浏览
- ⭐ 量表收藏
- 📊 量表详情查看
- 📝 版权许可申请
- 📧 工单系统
- 👥 团队协作

### 💳 计费系统
- 💰 积分制定价模型
- 🔄 月度积分刷新
- 📊 积分使用追踪
- 💳 Stripe 支付集成
- 📜 交易历史
- 📦 积分包管理

### 👑 管理后台
- 👥 用户管理
- 📊 量表管理
- 📝 案例管理
- 📧 工单处理
- 🏢 版权方管理
- 📊 数据统计

### 🎨 现代化 UI
- 🎨 Tailwind CSS + shadcn/ui
- 🌓 深色/浅色模式
- 📱 响应式设计
- ⚡ 加载动画
- 🔔 Toast 通知
- 🌍 中英文双语支持

## 🛠️ 技术栈

- **框架**: Next.js 15 + React 19
- **类型安全**: TypeScript
- **数据库**: Cloudflare D1 (SQLite) + Drizzle ORM
- **存储**: Cloudflare KV
- **认证**: Lucia Auth
- **支付**: Stripe
- **邮件**: Resend / Brevo
- **UI**: Tailwind CSS + shadcn/ui
- **部署**: Cloudflare Workers (边缘计算)

## 📦 快速开始

### 前置要求
- Node.js 18+
- pnpm 8+
- Cloudflare 账号

### 本地开发

1. **安装依赖**
```bash
pnpm install
```

2. **配置环境变量**
```bash
cp .dev.vars.example .dev.vars
cp .env.example .env
# 填写必需的环境变量
```

3. **初始化数据库**
```bash
pnpm db:migrate:dev
```

4. **启动开发服务器**
```bash
pnpm dev
```

5. **访问应用**
```
http://localhost:3000
```

## 📝 环境变量配置

### 必需变量

#### 认证相关
```bash
# Google OAuth (https://console.cloud.google.com/auth/clients/)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Turnstile (https://dash.cloudflare.com/turnstile)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
```

#### 邮件服务 (二选一)
```bash
# Resend
RESEND_API_KEY=your_resend_api_key

# 或 Brevo
BREVO_API_KEY=your_brevo_api_key
```

#### 支付服务
```bash
# Stripe (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 可选变量

#### GitHub Actions (部署用)
```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## 🗄️ 数据库管理

### 生成迁移文件
```bash
pnpm db:generate
```

### 应用迁移（本地）
```bash
pnpm db:migrate:dev
```

### 应用迁移（生产）
```bash
wrangler d1 migrations apply xcoa --remote
```

### 清空缓存
```bash
pnpm d1:cache:clean
```

## 📧 邮件模板开发

预览和编辑邮件模板：

```bash
pnpm email:dev
```

访问 http://localhost:3001 查看邮件模板预览

模板位置：`src/react-email/`

## 🚀 部署

### 准备工作

1. **创建 Cloudflare 资源**
   - D1 数据库
   - KV 命名空间
   - Turnstile 网站

2. **配置 Cloudflare Secrets**
```bash
wrangler secret put RESEND_API_KEY
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put STRIPE_SECRET_KEY
```

3. **更新 wrangler.jsonc**
   - 数据库 ID
   - KV 命名空间 ID
   - Account ID

### 部署到生产环境

#### 方式一：GitHub Actions 自动部署

1. 配置 GitHub Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. 推送到 main 分支自动触发部署

#### 方式二：手动部署

```bash
# 构建
pnpm run opennext:build

# 部署
pnpm run deploy
```

### 预览部署

```bash
pnpm run preview
```

## 📚 项目结构

```
xcoa/
├── src/
│   ├── app/              # Next.js 页面和路由
│   │   ├── (admin)/      # 管理后台
│   │   ├── (auth)/       # 认证相关页面
│   │   ├── (dashboard)/  # 用户仪表盘
│   │   └── api/          # API 路由
│   ├── components/       # React 组件
│   │   └── ui/           # shadcn/ui 组件
│   ├── db/               # 数据库相关
│   │   ├── schema.ts     # Drizzle 模式定义
│   │   └── migrations/   # 数据库迁移
│   ├── hooks/            # React Hooks
│   ├── lib/              # 工具函数
│   ├── react-email/      # 邮件模板
│   ├── state/            # 状态管理
│   └── utils/            # 辅助函数
├── public/               # 静态资源
├── wrangler.jsonc        # Cloudflare 配置
└── package.json
```

## 🧪 测试

```bash
# 运行 linter
pnpm lint

# 类型检查
pnpm cf-typegen
```

## 📊 性能优化

- ✅ 边缘计算（Cloudflare Workers）
- ✅ 零冷启动
- ✅ 全球 CDN 分发
- ✅ React Server Components
- ✅ 服务端渲染（SSR）
- ✅ 代码分割
- ✅ 图片优化

## 🔒 安全特性

- ✅ SQL 注入防护（Drizzle ORM）
- ✅ XSS 防护
- ✅ CSRF 保护
- ✅ Rate Limiting
- ✅ Session 安全管理
- ✅ 环境变量保护
- ✅ Turnstile 验证码

## 🌍 多语言支持

当前支持：
- 🇨🇳 简体中文
- 🇺🇸 English

切换语言：应用右下角语言切换按钮

## 📖 API 文档

API 文档位置：`/api`

主要端点：
- `/api/auth/*` - 认证相关
- `/api/scales/*` - 量表管理
- `/api/admin/*` - 管理后台
- `/api/copyright/*` - 版权相关
- `/api/billing/*` - 计费相关

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 编写清晰的提交信息
- 添加必要的注释

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

本项目基于以下优秀的开源项目构建：

- [Next.js](https://nextjs.org/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucia Auth](https://lucia-auth.com/)
- [OpenNext](https://opennext.js.org/)

## 📞 支持

- 📧 Email: support@xcoa.pro
- 🌐 Website: https://xcoa.pro
- 📚 Documentation: https://docs.xcoa.pro

## 🗺️ 路线图

### 近期计划
- [ ] 添加更多量表
- [ ] 增强搜索功能
- [ ] 移动端 App
- [ ] API 文档完善
- [ ] 单元测试覆盖

### 长期计划
- [ ] AI 辅助解读
- [ ] 数据分析工具
- [ ] 团队协作增强
- [ ] 多语言支持扩展
- [ ] Webhook 集成

---

**Built with ❤️ using Cloudflare Workers**
