-- 创建用户订阅表
CREATE TABLE IF NOT EXISTS user_subscription (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, paused
  currentPeriodStart TIMESTAMP,
  currentPeriodEnd TIMESTAMP,
  cancelAtPeriodEnd BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- 创建用户使用量追踪表
CREATE TABLE IF NOT EXISTS user_usage (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL, -- search, scale_view, ai_interpretation, api_call
  count INTEGER DEFAULT 0,
  periodStart TIMESTAMP,
  periodEnd TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, type, periodStart)
);

-- 创建功能访问日志表
CREATE TABLE IF NOT EXISTS feature_access_log (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  feature TEXT NOT NULL,
  accessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON格式的额外信息
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_subscription_userId ON user_subscription(userId);
CREATE INDEX IF NOT EXISTS idx_user_subscription_status ON user_subscription(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_userId_type ON user_usage(userId, type);
CREATE INDEX IF NOT EXISTS idx_user_usage_period ON user_usage(periodStart, periodEnd);
CREATE INDEX IF NOT EXISTS idx_feature_access_log_userId ON feature_access_log(userId);
CREATE INDEX IF NOT EXISTS idx_feature_access_log_feature ON feature_access_log(feature);
CREATE INDEX IF NOT EXISTS idx_feature_access_log_accessedAt ON feature_access_log(accessedAt);