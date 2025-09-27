# 数据库 Schema 快速参考

## 表列表

| 表名 | 主键前缀 | 描述 | 关键关系 |
|------|---------|------|---------|
| `user` | usr_ | 用户基础信息 | 核心实体，关联所有用户行为 |
| `passkey_credential` | pkey_ | 通行密钥认证 | user(1:N) |
| `team` | team_ | 团队管理 | user owner(1:N) |
| `team_membership` | member_ | 团队成员关系 | user(N:M)team |
| `team_role` | role_ | 团队角色定义 | team(1:N) |
| `team_invitation` | invite_ | 团队邀请 | team(1:N) |
| `credit_transaction` | credit_ | 积分交易记录 | user(1:N) |
| `purchased_items` | purchase_ | 购买项目记录 | user(1:N) |
| `ecoa_category` | cat_ | 量表分类 | - |
| `ecoa_scale` | scale_ | 量表主体信息 | category(N:1), copyright_holder(N:1) |
| `ecoa_item` | item_ | 量表题项 | ecoa_scale(N:1) |
| `user_search_history` | search_ | 用户搜索历史 | user(N:1) |
| `user_favorite` | fav_ | 用户收藏 | user(N:1), ecoa_scale(N:1) |
| `scale_usage` | usage_ | 量表使用记录 | user(N:1), ecoa_scale(N:1) |
| `copyright_holder` | copyright_ | 版权方信息 | - |
| `copyright_licenses` | license_ | 版权许可详情 | ecoa_scale(1:1) |
| `copyright_contact_request` | contact_ | 版权联系请求 | user(N:1), ecoa_scale(N:1), copyright_holder(N:1) |
| `scale_norms` | norm_ | 量表常模数据 | ecoa_scale(N:1) |
| `clinical_cases` | case_ | 临床案例 | ecoa_scale(N:1) |

## 字段类型参考

### 常用字段类型
- `text()` - 文本字段
- `text({ length: N })` - 限长文本
- `integer()` - 整数
- `real()` - 浮点数
- `integer({ mode: "timestamp" })` - 时间戳
- `text({ mode: 'json' })` - JSON字段

### 通用字段 (commonColumns)
```typescript
createdAt: integer({ mode: "timestamp" }) // 创建时间
updatedAt: integer({ mode: "timestamp" }) // 更新时间  
updateCounter: integer().default(0)       // 更新计数器
```

## 索引策略

### 主要索引
```sql
-- 用户相关索引
CREATE INDEX email_idx ON user(email);
CREATE INDEX role_idx ON user(role);

-- 量表相关索引
CREATE INDEX ecoa_scale_category_id_idx ON ecoa_scale(categoryId);
CREATE INDEX ecoa_scale_validation_status_idx ON ecoa_scale(validationStatus);
CREATE INDEX ecoa_scale_usage_count_idx ON ecoa_scale(usageCount);

-- 用户行为索引
CREATE INDEX user_favorite_user_id_idx ON user_favorite(userId);
CREATE INDEX user_favorite_scale_id_idx ON user_favorite(scaleId);
CREATE INDEX scale_usage_scale_id_idx ON scale_usage(scaleId);

-- 版权管理索引
CREATE INDEX copyright_contact_user_id_idx ON copyright_contact_request(userId);
CREATE INDEX copyright_contact_status_idx ON copyright_contact_request(status);
```

## 数据迁移历史

### 版本演进
1. **v1.0** - 基础用户和量表系统
2. **v1.1** - 添加团队管理功能
3. **v1.2** - 集成版权管理模块
4. **v1.3** - 引入常模数据和临床案例
5. **v1.4** - 优化搜索和使用统计

### 重要变更
- **版权字段整合**: 将版权信息从独立表整合到量表主表
- **JSON字段优化**: 统一JSON字段的类型定义
- **索引优化**: 添加复合索引提升查询性能

## API 端点映射

### 表与API端点对应关系

| 表名 | 主要API端点 | 操作类型 |
|------|------------|---------|
| `user` | `/api/auth/*` | 认证相关 |
| `team*` | `/api/teams/*` | 团队管理 |
| `ecoa_scale` | `/api/scales/*`, `/api/admin/scales/*` | 量表管理 |
| `user_favorite` | `/api/user/favorites/*` | 收藏管理 |
| `copyright_contact_request` | `/api/user/tickets/*` | 版权申请 |
| `credit_transaction` | `/api/billing/*` | 积分交易 |

## 开发指导

### 1. 新增表时注意事项
- 继承 `commonColumns` 获得标准时间戳字段
- 使用 `createId()` 生成唯一ID
- 添加适当的索引策略
- 定义明确的外键关系

### 2. 修改现有表结构
- 考虑向后兼容性
- 提供数据迁移脚本
- 更新相关的API端点
- 测试关联查询性能

### 3. 查询优化建议
- 避免N+1查询问题
- 使用适当的JOIN类型
- 利用现有索引
- 考虑分页和限制

---

*文档最后更新: 2025-09-27*
*Schema版本: 1.4*