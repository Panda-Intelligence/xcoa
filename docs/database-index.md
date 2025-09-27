# 数据库文档索引

本目录包含 xCOA 平台数据库相关的完整文档。

## 文档列表

### 📊 **数据库 ER 关系图** (`database-er-diagram.md`)
- 完整的实体关系图
- 模块化结构说明
- Mermaid图表展示
- 业务规则说明

### 🔗 **数据库表关系详解** (`database-relationships.md`)
- 详细的表间关系说明
- 查询模式和最佳实践
- 约束规则和业务逻辑
- 性能优化建议

### 📚 **数据库Schema快速参考** (`database-schema-reference.md`)
- 所有表的字段列表
- 索引策略说明
- API端点映射
- 开发指导原则

## 核心模块概述

### 🔐 **用户与认证**
- 用户管理 (`user`)
- 通行密钥认证 (`passkey_credential`)
- 角色权限控制

### 👥 **团队协作**
- 团队管理 (`team`)
- 成员关系 (`team_membership`)
- 角色权限 (`team_role`)
- 邀请系统 (`team_invitation`)

### 📋 **eCOA量表核心**
- 量表管理 (`ecoa_scale`)
- 题项管理 (`ecoa_item`)
- 分类系统 (`ecoa_category`)

### 📊 **用户行为分析**
- 搜索历史 (`user_search_history`)
- 收藏系统 (`user_favorite`)
- 使用统计 (`scale_usage`)

### ⚖️ **版权管理**
- 版权方信息 (`copyright_holder`)
- 许可管理 (`copyright_licenses`)
- 联系申请 (`copyright_contact_request`)

### 💳 **积分与支付**
- 积分交易 (`credit_transaction`)
- 购买记录 (`purchased_items`)

### 🧪 **扩展功能**
- 常模数据 (`scale_norms`)
- 临床案例 (`clinical_cases`)

## 使用指南

### 开发者须知
1. **字段命名**: 使用驼峰命名法
2. **主键格式**: 表名前缀 + 下划线 + CUID
3. **时间戳**: 统一使用 `commonColumns`
4. **JSON字段**: 明确类型定义
5. **索引策略**: 根据查询频率添加索引

### 数据完整性
- 外键约束确保关联完整性
- 唯一约束防止重复数据
- 业务规则在应用层验证
- 定期数据一致性检查

### 性能优化
- 合理使用索引
- 避免深层嵌套查询
- 使用分页减少数据传输
- 监控查询性能

## 维护与迁移

### 数据库迁移
```bash
# 生成迁移文件
pnpm run db:generate --name migration_name

# 应用迁移 (开发环境)
pnpm run db:migrate:dev

# 清理缓存
pnpm run d1:cache:clean
```

### 备份策略
- 定期自动备份
- 关键数据额外保护
- 版权信息特别备份
- 用户数据隐私保护

---

*文档版本: 1.0*
*最后更新: 2025-09-27*
*维护者: xCOA 开发团队*