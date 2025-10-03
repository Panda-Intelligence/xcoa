-- 测试订阅功能的 SQL 脚本
-- 创建具有不同订阅级别的测试团队

-- 1. 免费版团队 (默认)
INSERT INTO team (
  id, 
  name, 
  slug, 
  planId, 
  planExpiresAt,
  creditBalance,
  createdAt,
  updatedAt
) VALUES (
  'team_free_test_001',
  '免费版测试团队',
  'free-test-team',
  NULL, -- 或 'free'
  NULL,
  100,
  datetime('now'),
  datetime('now')
);

-- 2. Starter 订阅团队
INSERT INTO team (
  id, 
  name, 
  slug, 
  planId, 
  planExpiresAt,
  creditBalance,
  createdAt,
  updatedAt
) VALUES (
  'team_starter_test_001',
  'Starter 测试团队',
  'starter-test-team',
  'starter',
  datetime('now', '+30 days'), -- 30天后过期
  2000,
  datetime('now'),
  datetime('now')
);

-- 3. Enterprise 订阅团队
INSERT INTO team (
  id, 
  name, 
  slug, 
  planId, 
  planExpiresAt,
  creditBalance,
  createdAt,
  updatedAt
) VALUES (
  'team_enterprise_test_001',
  'Enterprise 测试团队',
  'enterprise-test-team',
  'enterprise',
  datetime('now', '+365 days'), -- 1年后过期
  999999,
  datetime('now'),
  datetime('now')
);

-- 4. 已过期的 Enterprise 团队（用于测试过期逻辑）
INSERT INTO team (
  id, 
  name, 
  slug, 
  planId, 
  planExpiresAt,
  creditBalance,
  createdAt,
  updatedAt
) VALUES (
  'team_expired_test_001',
  '已过期测试团队',
  'expired-test-team',
  'enterprise',
  datetime('now', '-7 days'), -- 7天前已过期
  0,
  datetime('now'),
  datetime('now')
);

-- 添加用户到测试团队
-- 注意：需要替换 'your_user_id' 为实际的用户 ID

-- 加入免费版团队
INSERT INTO team_membership (
  id,
  teamId,
  userId,
  roleId,
  isSystemRole,
  joinedAt,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'tmem_free_001',
  'team_free_test_001',
  'your_user_id', -- 替换为实际用户 ID
  'owner',
  1,
  datetime('now'),
  1,
  datetime('now'),
  datetime('now')
);

-- 加入 Starter 团队
INSERT INTO team_membership (
  id,
  teamId,
  userId,
  roleId,
  isSystemRole,
  joinedAt,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'tmem_starter_001',
  'team_starter_test_001',
  'your_user_id', -- 替换为实际用户 ID
  'owner',
  1,
  datetime('now'),
  1,
  datetime('now'),
  datetime('now')
);

-- 加入 Enterprise 团队
INSERT INTO team_membership (
  id,
  teamId,
  userId,
  roleId,
  isSystemRole,
  joinedAt,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'tmem_enterprise_001',
  'team_enterprise_test_001',
  'your_user_id', -- 替换为实际用户 ID
  'owner',
  1,
  datetime('now'),
  1,
  datetime('now'),
  datetime('now')
);

-- 查询验证
SELECT 
  t.name as team_name,
  t.planId,
  t.planExpiresAt,
  t.creditBalance,
  CASE 
    WHEN t.planExpiresAt IS NULL THEN '永久'
    WHEN datetime(t.planExpiresAt) > datetime('now') THEN '有效'
    ELSE '已过期'
  END as status
FROM team t
WHERE t.id LIKE 'team_%test%'
ORDER BY t.createdAt;

-- 查看用户的团队成员关系
SELECT 
  t.name as team_name,
  t.planId,
  tm.roleId,
  tm.isActive
FROM team_membership tm
JOIN team t ON tm.teamId = t.id
WHERE tm.userId = 'your_user_id'
ORDER BY t.createdAt;
