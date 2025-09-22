-- 量表收藏管理系统数据库结构
-- 2025-09-21 新功能开发

-- 1. 用户收藏表
CREATE TABLE IF NOT EXISTS user_scale_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scale_id TEXT NOT NULL,
  collection_id TEXT,              -- 所属收藏分类（可选）
  personal_notes TEXT,             -- 个人笔记
  tags TEXT,                       -- JSON格式标签数组
  priority INTEGER DEFAULT 0,      -- 优先级（0-5）
  is_pinned BOOLEAN DEFAULT FALSE, -- 是否置顶
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES user_collections(id) ON DELETE SET NULL,
  
  -- 确保用户不能重复收藏同一个量表
  UNIQUE(user_id, scale_id)
);

-- 2. 收藏分类表
CREATE TABLE IF NOT EXISTS user_collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,              -- 分类名称
  description TEXT,                -- 分类描述
  color TEXT DEFAULT 'blue',       -- 分类颜色标识
  icon TEXT DEFAULT 'folder',      -- 分类图标
  is_public BOOLEAN DEFAULT FALSE, -- 是否公开分享
  is_default BOOLEAN DEFAULT FALSE, -- 是否默认分类
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 量表收藏统计表
CREATE TABLE IF NOT EXISTS scale_favorite_stats (
  scale_id TEXT PRIMARY KEY,
  total_favorites INTEGER DEFAULT 0,
  recent_favorites INTEGER DEFAULT 0, -- 近30天新增收藏
  monthly_favorites INTEGER DEFAULT 0, -- 本月收藏数
  trending_score REAL DEFAULT 0.0,   -- 趋势分数
  last_updated DATETIME DEFAULT (datetime('now')),
  
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id) ON DELETE CASCADE
);

-- 4. 收藏分享表（团队协作功能）
CREATE TABLE IF NOT EXISTS collection_shares (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  shared_by_user_id TEXT NOT NULL,
  shared_with_user_id TEXT,        -- 特定用户（可选）
  shared_with_team_id TEXT,        -- 团队分享（可选）
  share_token TEXT UNIQUE,         -- 分享链接token
  permission_level TEXT DEFAULT 'view', -- view/edit/admin
  expires_at DATETIME,             -- 分享过期时间
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT (datetime('now')),
  
  FOREIGN KEY (collection_id) REFERENCES user_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON user_scale_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_scale_id ON user_scale_favorites(scale_id);
CREATE INDEX IF NOT EXISTS idx_favorites_collection_id ON user_scale_favorites(collection_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON user_scale_favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_pinned ON user_scale_favorites(is_pinned DESC);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_sort_order ON user_collections(sort_order);
CREATE INDEX IF NOT EXISTS idx_collections_public ON user_collections(is_public);

CREATE INDEX IF NOT EXISTS idx_favorite_stats_trending ON scale_favorite_stats(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_stats_total ON scale_favorite_stats(total_favorites DESC);

CREATE INDEX IF NOT EXISTS idx_shares_collection ON collection_shares(collection_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON collection_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_shares_expires ON collection_shares(expires_at);

-- 6. 创建默认收藏分类的触发器
-- 当用户首次收藏时，自动创建默认分类
CREATE TRIGGER IF NOT EXISTS create_default_collection 
AFTER INSERT ON user_scale_favorites
FOR EACH ROW
WHEN NEW.collection_id IS NULL
BEGIN
  INSERT OR IGNORE INTO user_collections (
    id, user_id, name, description, is_default, created_at, updated_at
  ) VALUES (
    'collection_' || NEW.user_id || '_default',
    NEW.user_id,
    '我的收藏',
    '默认收藏分类',
    TRUE,
    datetime('now'),
    datetime('now')
  );
  
  UPDATE user_scale_favorites 
  SET collection_id = 'collection_' || NEW.user_id || '_default'
  WHERE id = NEW.id;
END;

-- 7. 更新收藏统计的触发器
CREATE TRIGGER IF NOT EXISTS update_favorite_stats_on_add
AFTER INSERT ON user_scale_favorites
FOR EACH ROW
BEGIN
  INSERT OR REPLACE INTO scale_favorite_stats (
    scale_id, 
    total_favorites, 
    recent_favorites,
    last_updated
  ) VALUES (
    NEW.scale_id,
    COALESCE((SELECT total_favorites FROM scale_favorite_stats WHERE scale_id = NEW.scale_id), 0) + 1,
    COALESCE((SELECT recent_favorites FROM scale_favorite_stats WHERE scale_id = NEW.scale_id), 0) + 1,
    datetime('now')
  );
END;

CREATE TRIGGER IF NOT EXISTS update_favorite_stats_on_remove
AFTER DELETE ON user_scale_favorites
FOR EACH ROW
BEGIN
  UPDATE scale_favorite_stats 
  SET 
    total_favorites = MAX(0, total_favorites - 1),
    last_updated = datetime('now')
  WHERE scale_id = OLD.scale_id;
END;

-- 8. 插入一些示例收藏分类
INSERT OR IGNORE INTO user_collections (id, user_id, name, description, color, icon, is_default, sort_order) VALUES
('collection_demo_research', 'demo_user', '研究项目', '用于研究项目的量表收藏', 'blue', 'beaker', FALSE, 1),
('collection_demo_clinical', 'demo_user', '临床常用', '临床工作中常用的量表', 'green', 'stethoscope', FALSE, 2),
('collection_demo_teaching', 'demo_user', '教学材料', '用于教学和培训的量表', 'purple', 'graduation-cap', FALSE, 3);

-- 验证表结构
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%favorite%' OR name LIKE '%collection%';