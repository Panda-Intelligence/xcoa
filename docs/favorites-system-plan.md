# 量表收藏管理系统实施方案

## 🎯 功能目标

为xCOA用户提供个人化的量表收藏和管理功能，支持研究项目、临床工作、学习需求的量表组织。

## 📊 功能需求分析

### 核心功能列表
1. **一键收藏**: 量表详情页快速收藏/取消收藏
2. **收藏列表**: 个人收藏量表的完整管理界面
3. **分类管理**: 按项目、用途、研究类型分组
4. **收藏笔记**: 为每个收藏添加个人注释和标签
5. **快速访问**: 从任何页面快速访问收藏

### 用户使用场景
- **研究者**: 为不同研究项目收藏相关量表
- **临床医生**: 收藏常用的诊断和评估工具
- **学生**: 收藏学习和论文中需要的量表
- **团队**: 分享和协作使用量表集合

## 🏗️ 数据库设计

### 核心表结构
```sql
-- 用户收藏表
CREATE TABLE user_scale_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scale_id TEXT NOT NULL,
  collection_id TEXT,              -- 所属收藏分类
  personal_notes TEXT,             -- 个人笔记
  tags TEXT,                       -- JSON格式标签
  priority INTEGER DEFAULT 0,      -- 优先级
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id),
  FOREIGN KEY (collection_id) REFERENCES user_collections(id)
);

-- 收藏分类表
CREATE TABLE user_collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,              -- 分类名称
  description TEXT,                -- 分类描述
  color TEXT,                      -- 分类颜色标识
  icon TEXT,                       -- 分类图标
  is_public BOOLEAN DEFAULT FALSE, -- 是否公开分享
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 收藏统计表
CREATE TABLE scale_favorite_stats (
  scale_id TEXT PRIMARY KEY,
  total_favorites INTEGER DEFAULT 0,
  recent_favorites INTEGER DEFAULT 0, -- 近30天
  trending_score REAL DEFAULT 0,
  updated_at DATETIME,
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id)
);
```

### 索引优化
```sql
CREATE INDEX idx_favorites_user_id ON user_scale_favorites(user_id);
CREATE INDEX idx_favorites_scale_id ON user_scale_favorites(scale_id);
CREATE INDEX idx_favorites_collection ON user_scale_favorites(collection_id);
CREATE INDEX idx_collections_user_id ON user_collections(user_id);
CREATE INDEX idx_favorite_stats_trending ON scale_favorite_stats(trending_score DESC);
```

## 🎨 前端组件设计

### 1. 收藏按钮组件
```typescript
// FavoriteButton.tsx
interface FavoriteButtonProps {
  scaleId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

<FavoriteButton
  scaleId="scale_phq9"
  showCount={true}
  size="md"
/>
```

### 2. 收藏管理界面
```typescript
// CollectionManager.tsx
<CollectionManager>
  <CollectionList>
    <Collection name="我的研究项目" count={12} color="blue" />
    <Collection name="常用量表" count={8} color="green" />
    <Collection name="学习资料" count={5} color="purple" />
  </CollectionList>

  <CollectionContent>
    <ScaleCard scale={scale} notes={userNotes} tags={userTags} />
  </CollectionContent>
</CollectionManager>
```

### 3. 快速收藏面板
```typescript
// QuickFavorites.tsx - 侧边栏组件
<QuickFavorites>
  <RecentlyAdded scales={recentFavorites} />
  <TrendingCollections collections={trendingCollections} />
  <QuickActions>
    <CreateCollection />
    <ImportFavorites />
    <ShareCollection />
  </QuickActions>
</QuickFavorites>
```

## 🔧 API设计

### 收藏管理API
```typescript
// GET /api/user/favorites
// 获取用户收藏列表
interface FavoritesResponse {
  collections: Collection[];
  favorites: ScaleFavorite[];
  statistics: FavoriteStats;
}

// POST /api/user/favorites/add
// 添加收藏
interface AddFavoriteRequest {
  scaleId: string;
  collectionId?: string;
  notes?: string;
  tags?: string[];
}

// DELETE /api/user/favorites/{favoriteId}
// 移除收藏

// PUT /api/user/favorites/{favoriteId}
// 更新收藏（笔记、标签、分类）
```

### 收藏分类API
```typescript
// GET /api/user/collections
// 获取用户的收藏分类

// POST /api/user/collections
// 创建新分类
interface CreateCollectionRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

// PUT /api/user/collections/{collectionId}
// 更新分类信息

// DELETE /api/user/collections/{collectionId}
// 删除分类（需要处理其中的收藏）
```

## 🎯 用户体验设计

### 收藏操作流程
```
1. 量表详情页 → 点击❤️按钮 → 弹出收藏选项
   ├─ 添加到现有分类
   ├─ 创建新分类
   └─ 添加笔记和标签

2. 收藏成功 → 按钮变为❤️(已收藏) → 显示收藏数量

3. 收藏管理 → /scales/favorites → 完整管理界面
   ├─ 分类浏览
   ├─ 搜索收藏
   ├─ 批量操作
   └─ 导出分享
```

### 智能推荐融合
```typescript
// 基于收藏的智能推荐
interface PersonalizedRecommendation {
  basedOnFavorites: Scale[];     // 基于收藏相似性
  basedOnSearchHistory: Scale[]; // 基于搜索历史
  trendingInField: Scale[];      // 领域内热门
  expertCurated: Scale[];        // 专家推荐
}
```

## 🚀 实施路线

### Phase 1: 基础收藏功能 (3天)
- [ ] 数据库表创建和迁移
- [ ] 基础API开发 (add/remove/list)
- [ ] FavoriteButton组件开发
- [ ] 量表详情页集成收藏按钮

### Phase 2: 收藏管理界面 (2天)
- [ ] 收藏列表页面开发
- [ ] 收藏分类管理功能
- [ ] 笔记和标签功能
- [ ] 搜索和筛选功能

### Phase 3: 高级功能 (2天)
- [ ] 批量操作功能
- [ ] 收藏分享功能
- [ ] 个性化推荐集成
- [ ] 收藏统计和分析

## 📱 页面路由设计

```
/scales/favorites              // 收藏主页
├── /scales/favorites/collections   // 分类管理
├── /scales/favorites/shared        // 分享的收藏
├── /scales/favorites/analytics     // 收藏统计
└── /scales/favorites/settings      // 收藏设置
```

## 🧪 测试验证

### 功能测试场景
1. **基础操作**: 收藏→取消收藏→重新收藏
2. **分类管理**: 创建分类→移动收藏→删除分类
3. **批量操作**: 选择多个→批量移动→批量删除
4. **搜索测试**: 在收藏中搜索特定量表
5. **性能测试**: 大量收藏时的响应速度

### 用户接受度测试
- **易用性**: 操作是否直观简单
- **实用性**: 是否真正提升工作效率
- **可靠性**: 收藏数据是否安全可靠

---

**📅 开发时间**: 1周内完成完整功能
**🎯 目标**: 提供专业级的个人量表管理体验
**📈 价值**: 提升用户粘性和平台使用深度