# 数据库表关系详细参考

## 表间关系详解

### 1. 用户模块关系

#### 用户 ↔ 团队关系
```
user (1) ←→ (N) team_membership ←→ (1) team
user (1) ←→ (N) team (as owner)
team (1) ←→ (N) team_role
team_role (1) ←→ (N) team_membership
team_role (1) ←→ (N) team_invitation
```

#### 用户行为关系
```
user (1) ←→ (N) user_search_history
user (1) ←→ (N) user_favorite ←→ (1) ecoa_scale
user (1) ←→ (N) scale_usage ←→ (1) ecoa_scale
user (1) ←→ (N) passkey_credential
user (1) ←→ (N) credit_transaction
```

### 2. eCOA量表模块关系

#### 量表核心关系
```
ecoa_category (1) ←→ (N) ecoa_scale
ecoa_scale (1) ←→ (N) ecoa_item
ecoa_scale (1) ←→ (N) scale_norms
ecoa_scale (1) ←→ (N) clinical_cases
```

#### 量表与用户关系
```
ecoa_scale (1) ←→ (N) user_favorite ←→ (1) user
ecoa_scale (1) ←→ (N) scale_usage ←→ (1) user
```

### 3. 版权管理关系

#### 版权核心关系
```
copyright_holder (1) ←→ (N) ecoa_scale
ecoa_scale (1) ←→ (1) copyright_licenses
copyright_holder (1) ←→ (N) copyright_contact_request
ecoa_scale (1) ←→ (N) copyright_contact_request
user (1) ←→ (N) copyright_contact_request
```

## 关键约束与业务规则

### 1. 唯一性约束

#### 用户相关
- `user.email` - 邮箱全局唯一
- `passkey_credential.credentialId` - 凭证ID唯一
- `team.slug` - 团队标识唯一

#### 量表相关
- `user_favorite(userId, scaleId)` - 用户量表收藏唯一性
- `team_membership(teamId, userId)` - 团队成员唯一性

### 2. 级联规则

#### 删除级联
- 删除用户 → 自动删除相关的认证凭证、搜索历史、收藏记录
- 删除团队 → 自动删除团队成员关系、角色、邀请
- 删除量表 → 自动删除题项、收藏记录、使用记录、常模数据

#### 更新级联
- 用户角色变更 → 影响权限系统
- 量表状态变更 → 影响可见性和访问权限

### 3. 业务完整性规则

#### 权限验证
- 只有管理员可以创建/编辑量表
- 团队成员权限基于角色定义
- 版权联系请求需要用户认证

#### 数据一致性
- 量表题项数量与itemsCount字段同步
- 收藏数量与favoriteCount字段同步
- 使用次数与usageCount字段同步

## 查询模式

### 1. 常用查询组合

#### 量表详情页面
```sql
SELECT s.*, c.name as categoryName, ch.name as copyrightHolderName
FROM ecoa_scale s
LEFT JOIN ecoa_category c ON s.categoryId = c.id
LEFT JOIN copyright_holder ch ON s.copyrightHolderId = ch.id
WHERE s.id = ?
```

#### 用户收藏列表
```sql
SELECT s.*, uf.notes, uf.createdAt as favoriteTime
FROM user_favorite uf
JOIN ecoa_scale s ON uf.scaleId = s.id
LEFT JOIN ecoa_category c ON s.categoryId = c.id
WHERE uf.userId = ?
ORDER BY uf.createdAt DESC
```

#### 版权联系请求
```sql
SELECT cr.*, s.name as scaleName, ch.name as copyrightHolderName
FROM copyright_contact_request cr
JOIN ecoa_scale s ON cr.scaleId = s.id
JOIN copyright_holder ch ON cr.copyrightHolderId = ch.id
WHERE cr.userId = ?
ORDER BY cr.createdAt DESC
```

### 2. 统计查询

#### 量表使用统计
```sql
SELECT 
  s.id,
  s.name,
  COUNT(su.id) as viewCount,
  COUNT(uf.id) as favoriteCount
FROM ecoa_scale s
LEFT JOIN scale_usage su ON s.id = su.scaleId AND su.actionType = 'view'
LEFT JOIN user_favorite uf ON s.id = uf.scaleId
GROUP BY s.id
```

#### 用户活跃度统计
```sql
SELECT 
  u.id,
  COUNT(DISTINCT ush.id) as searchCount,
  COUNT(DISTINCT uf.id) as favoriteCount,
  COUNT(DISTINCT su.id) as usageCount
FROM user u
LEFT JOIN user_search_history ush ON u.id = ush.userId
LEFT JOIN user_favorite uf ON u.id = uf.userId
LEFT JOIN scale_usage su ON u.id = su.userId
GROUP BY u.id
```

## 数据类型说明

### JSON字段结构

#### psychometricProperties
```json
{
  "reliability": {
    "cronbach_alpha": 0.92,
    "test_retest": 0.87
  },
  "validity": {
    "content_validity": "established",
    "construct_validity": "confirmed"
  },
  "factor_structure": {
    "factors": 2,
    "variance_explained": 0.65
  }
}
```

#### responseOptions
```json
[
  "从不",
  "偶尔", 
  "有时",
  "经常",
  "总是"
]
```

#### percentiles (scale_norms)
```json
{
  "p25": 12,
  "p50": 18,
  "p75": 24,
  "p90": 28,
  "p95": 31
}
```

### 枚举值定义

#### 用户角色
- `admin` - 系统管理员
- `user` - 普通用户

#### 量表验证状态
- `draft` - 草稿
- `validated` - 已验证
- `published` - 已发布

#### 许可类型
- `public_domain` - 公共领域
- `academic_free` - 学术免费
- `commercial` - 商业许可
- `contact_required` - 需要联系

#### 请求类型
- `license_inquiry` - 许可咨询
- `usage_request` - 使用请求
- `support` - 技术支持
- `other` - 其他

## 维护注意事项

### 1. 数据迁移
- 添加新字段时注意默认值设置
- 修改外键时确保数据一致性
- JSON字段变更需要兼容性处理

### 2. 性能监控
- 监控索引使用效率
- 定期分析查询性能
- 优化大表的分页查询

### 3. 备份策略
- 定期备份关键表数据
- 版权信息特别重要，需要额外保护
- 用户数据隐私保护合规

---

*最后更新: 2025-09-27*