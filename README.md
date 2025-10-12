# OpeneCOA - 开放的 eCOA 量表平台

[![Deploy Status](https://img.shields.io/badge/deploy-cloudflare-orange)](https://openecoa.com)

OpeneCOA 是一个开放的 eCOA（电子化临床结果评估）量表平台，基于 Cloudflare Workers 构建，为科研人员和临床医生提供量表检索、专业解读、版权授权申请和 eCOA 报告服务。

## 🎯 核心服务

### 🔍 量表检索服务
- 🤖 AI 智能搜索 - 语义理解，快速匹配
- 📚 15+ 专业量表库 - 覆盖多个临床领域
- ⭐ 量表收藏管理
- 📊 量表详情查看
- 📱 多设备响应式体验

### 📖 专业解读服务
- 📝 量表使用指导
- 📊 评分方法说明
- 🎓 临床应用案例
- 💡 结果解读指南
- 🔬 心理测量学属性

### 📜 版权授权服务
- 📧 版权方联系服务
- 📋 工单管理系统
- 💼 授权申请流程
- 📄 许可文档管理
- 👥 团队协作支持

### 📈 eCOA 报告服务
- 📊 量表数据分析
- 📋 专业报告生成
- 📤 多格式导出 (PDF/HTML/TXT)
- 📈 使用统计追踪
- 🔐 数据安全保障

### 🔐 认证与安全
- 📧 邮箱/密码注册登录
- 🔑 WebAuthn/Passkey 认证
- 🌐 Google OAuth/SSO 集成
- 🔄 忘记密码流程
- ✉️ 邮箱验证
- 🗝️ Session 管理（Cloudflare KV）
- 🤖 Turnstile 验证码
- ⚡ API 限流保护

## 🏗️ 技术架构

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

- 📧 Email: support@openecoa.com
- 🌐 Website: https://openecoa.com
- 📚 Documentation: https://docs.openecoa.com

## 🗺️ 项目愿景与规划

### 🌟 使命
打造开放、专业的 eCOA 量表服务平台，为临床研究和医疗实践提供一站式 eCOA 解决方案。

### 🎯 核心目标
1. **开放检索** - 提供免费的量表检索服务，降低研究门槛
2. **专业解读** - 提供权威的量表使用指导和结果解读
3. **便捷授权** - 简化版权授权流程，连接研究者与版权方
4. **规范报告** - 提供标准化的 eCOA 报告服务

### 📋 近期计划
- [ ] 扩充量表库至 100+ 量表
- [ ] 完善量表解读指南
- [ ] 优化 AI 搜索算法
- [ ] 增加临床案例库
- [ ] 开发移动端应用

### 🚀 长期愿景
- [ ] 建立 eCOA 行业标准
- [ ] 提供 API 接口服务
- [ ] 支持多语言国际化
- [ ] 开发数据分析工具
- [ ] 构建研究者社区

---

**Built with ❤️ using Cloudflare Workers**
