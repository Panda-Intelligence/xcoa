# xCOA 开发备忘录

## 🚀 快速启动

```bash
# 启动开发服务器
pnpm run dev

# 应用数据库迁移
pnpm run db:migrate:dev

# 生成 Cloudflare 类型
pnpm run cf-typegen

# 预览邮件模板
pnpm run email:dev
```

## 📁 重要文件位置

### 🗄️ 数据库
- **模型定义：** `src/db/schema.ts`
- **迁移文件：** `src/db/migrations/0009_ecoa-tables.sql`
- **种子数据：** `scripts/seed-ecoa.sql`

### 🔍 搜索 API
- **基础搜索：** `src/app/api/search/route.ts`
- **语义搜索：** `src/app/api/search/semantic/route.ts`
- **搜索建议：** `src/app/api/search/suggestions/route.ts`
- **筛选选项：** `src/app/api/search/filters/route.ts`

### 🎨 前端组件
- **搜索界面：** `src/components/landing/SearchInterface.tsx`
- **Google 风格搜索：** `src/components/landing/GoogleStyleSearch.tsx`
- **首页介绍：** `src/components/landing/HeroSection.tsx`

### ⚙️ 配置
- **Cloudflare：** `wrangler.jsonc`
- **数据库：** `drizzle.config.ts`
- **项目设置：** `src/constants.ts`

## 🧪 快速测试

```bash
# 测试基础搜索
curl -X POST localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "PHQ-9"}'

# 测试语义搜索  
curl -X POST localhost:3000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "抑郁症筛查"}'

# 测试搜索建议
curl "localhost:3000/api/search/suggestions?query=PHQ"

# 测试筛选选项
curl "localhost:3000/api/search/filters"
```

## 🔧 常用命令

### 数据库操作
```bash
# 生成新迁移
pnpm run db:generate migration-name

# 应用迁移到本地
pnpm run db:migrate:dev

# 重置本地数据库
rm -rf .wrangler/state/v3/d1
pnpm run db:migrate:dev
```

### Cloudflare 操作
```bash
# 创建 Vectorize 索引
wrangler vectorize create xcoa-ecoa-search --dimensions=1536

# 部署到 Cloudflare
pnpm run deploy

# 查看远程日志
wrangler tail

# 生成类型定义
pnpm run cf-typegen
```

## 📊 当前数据

### 量表分类 (5个)
1. **cat_01** - 抑郁症评估 (1个量表)
2. **cat_02** - 焦虑症评估 (1个量表)  
3. **cat_03** - 认知功能评估 (1个量表)
4. **cat_04** - 生活质量评估 (2个量表)
5. **cat_05** - 疼痛评估 (0个量表)

### 核心量表 (5个)
1. **scale_phq9** - PHQ-9 (9题项)
2. **scale_gad7** - GAD-7 (7题项)
3. **scale_mmse2** - MMSE-2 
4. **scale_eortc** - EORTC QLQ-C30
5. **scale_sf36** - SF-36

## 🎯 下一步待办

### 🔥 高优先级
- [ ] 修复 Vectorize API 权限问题
- [ ] 集成真正的向量搜索
- [ ] 添加更多量表数据 (目标: 20+)

### 📋 中优先级  
- [ ] 完善前端搜索界面
- [ ] 添加量表详情页面
- [ ] 实现搜索历史功能

### 💡 低优先级
- [ ] 用户收藏功能
- [ ] 搜索统计分析
- [ ] 导出功能

## 🚨 已知问题

### API 权限问题
```bash
# Vectorize 创建失败
wrangler vectorize create xcoa-ecoa-search
# Error: Authentication error [code: 10000]
```
**解决方案：** 检查 API Token 权限，确保包含 Vectorize 访问权限

### 搜索性能
- 当前语义搜索基于关键词映射，不是真正的向量搜索
- 需要集成 Workers AI 和 Vectorize 提升准确性

## 📱 环境变量

### 开发环境 (.dev.vars)
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx
TURNSTILE_SECRET_KEY=xxx
RESEND_API_KEY=xxx
STRIPE_PUBLIC_KEY=xxx
STRIPE_SECRET_KEY=xxx
```

### 生产环境 (wrangler secrets)
```bash
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put RESEND_API_KEY  
wrangler secret put STRIPE_SECRET_KEY
```

## 🔗 有用链接

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **D1 数据库:** https://dash.cloudflare.com/d1
- **Vectorize 控制台:** https://dash.cloudflare.com/vectorize
- **Workers AI 文档:** https://developers.cloudflare.com/workers-ai
- **项目仓库:** https://github.com/Panda-Intelligence/xcoa

---

**保存时间：** 2025-09-20  
**下次更新：** 开发进展时更新  
**状态：** 📝 开发中