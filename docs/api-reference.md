# xCOA 搜索 API 文档

## 🔍 API 概览

xCOA 提供8个核心搜索和详情 API，支持精确搜索、语义搜索、向量搜索、混合搜索、高级筛选和量表详情展示。

**Base URL:** `http://localhost:3000` (开发环境)

## 📋 API 接口列表

| 接口 | 方法 | 功能 | 响应时间 |
|------|------|------|----------|
| `/api/search` | POST | 基础搜索 | ~400ms |
| `/api/search/semantic` | POST | 语义搜索 | ~450ms |
| `/api/search/vector` | POST | 向量搜索 | ~600ms |
| `/api/search/hybrid` | POST | 混合搜索 | ~500ms |
| `/api/search/advanced` | POST | 高级筛选 | ~500ms |
| `/api/search/suggestions` | GET | 搜索建议 | ~200ms |
| `/api/search/filters` | GET | 筛选选项 | ~300ms |
| `/api/scales/[scaleId]` | GET | 量表详情 | ~400ms |

## 1. 基础搜索 API

**接口：** `POST /api/search`  
**功能：** 关键词匹配搜索，支持筛选、排序、分页

### 请求参数
```typescript
{
  query: string,           // 搜索关键词 (必需, 1-500字符)
  category?: string,       // 分类筛选 (可选)
  sortBy?: "relevance" | "name" | "usage" | "recent", // 排序方式
  page?: number,          // 页码 (默认: 1)
  limit?: number,         // 每页数量 (默认: 20, 最大: 50)
  filters?: {             // 高级筛选 (可选)
    validationStatus?: string,
    languages?: string[],
    itemsCountMin?: number,
    itemsCountMax?: number,
    administrationTimeMax?: number
  }
}
```

### 响应示例
```json
{
  "results": [
    {
      "id": "scale_phq9",
      "name": "患者健康问卷-9",
      "nameEn": "Patient Health Questionnaire-9", 
      "acronym": "PHQ-9",
      "description": "PHQ-9是一个广泛使用的抑郁症筛查...",
      "category": "抑郁症评估",
      "items_count": 9,
      "validation_status": "validated",
      "match_score": 100,
      "languages": ["zh-CN", "en-US"],
      "administrationTime": 5,
      "usageCount": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20, 
    "total": 1,
    "totalPages": 1
  },
  "searches_remaining": 10
}
```

### 使用示例
```bash
# 搜索 PHQ-9 量表
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "PHQ-9",
    "sortBy": "relevance"
  }'

# 筛选抑郁症相关量表
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "depression",
    "category": "cat_01",
    "filters": {
      "validationStatus": "validated",
      "languages": ["zh-CN"]
    }
  }'
```

## 2. 语义搜索 API

**接口：** `POST /api/search/semantic`  
**功能：** AI 驱动的语义理解搜索，智能扩展查询词汇

### 请求参数
```typescript
{
  query: string,    // 搜索查询 (必需, 1-500字符)
  limit?: number    // 结果数量 (默认: 10, 最大: 50)
}
```

### 响应示例
```json
{
  "results": [
    {
      "id": "scale_phq9",
      "name": "患者健康问卷-9",
      "acronym": "PHQ-9", 
      "semantic_score": 185,
      "match_score": 185,
      "category": "抑郁症评估"
    }
  ],
  "query": "抑郁症筛查",
  "expandedTerms": [
    "抑郁症筛查", "depression", "depressive", "mood", 
    "phq", "beck", "hamilton", "screening", "assessment"
  ],
  "searchType": "semantic",
  "totalResults": 4
}
```

### 语义映射示例
```typescript
// 中文查询自动扩展英文相关词汇
"抑郁症" → ["depression", "depressive", "mood", "phq", "beck", "hamilton"]
"焦虑" → ["anxiety", "gad", "panic", "worry", "stress"]  
"认知" → ["cognitive", "memory", "attention", "mmse", "moca"]
"筛查" → ["screening", "assessment", "evaluation", "scale"]
```

### 使用示例
```bash
# 语义搜索抑郁症相关量表
curl -X POST http://localhost:3000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "抑郁症筛查",
    "limit": 5
  }'

# 语义搜索焦虑评估工具
curl -X POST http://localhost:3000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "焦虑评估",
    "limit": 10
  }'
```

## 3. 搜索建议 API

**接口：** `GET /api/search/suggestions`  
**功能：** 智能搜索补全和建议

### 请求参数
```typescript
query: string,    // 查询前缀 (必需, 1-100字符)
limit?: number    // 建议数量 (默认: 5, 最大: 10)
```

### 响应示例
```json
{
  "suggestions": [
    {
      "id": "scale_phq9",
      "text": "患者健康问卷-9 (PHQ-9)",
      "acronym": "PHQ-9", 
      "name": "患者健康问卷-9",
      "nameEn": "Patient Health Questionnaire-9",
      "usageCount": 0
    }
  ],
  "query": "PHQ"
}
```

### 使用示例
```bash
# 获取 PHQ 相关建议
curl "http://localhost:3000/api/search/suggestions?query=PHQ&limit=5"

# 获取 GAD 相关建议  
curl "http://localhost:3000/api/search/suggestions?query=GAD"
```

## 4. 筛选选项 API

**接口：** `GET /api/search/filters`  
**功能：** 获取动态筛选选项和统计信息

### 响应示例
```json
{
  "categories": [
    {
      "id": "cat_01",
      "name": "抑郁症评估",
      "nameEn": "Depression Assessment", 
      "scaleCount": 1
    }
  ],
  "validationStatuses": [
    {
      "value": "validated",
      "label": "已验证",
      "count": 5
    }
  ],
  "languages": [
    {
      "value": "zh-CN", 
      "label": "中文"
    },
    {
      "value": "en-US",
      "label": "English" 
    }
  ],
  "ranges": {
    "itemsCount": {
      "min": 7,
      "max": 36
    },
    "administrationTime": {
      "min": 3, 
      "max": 15
    }
  }
}
```

### 使用示例
```bash
# 获取所有筛选选项
curl "http://localhost:3000/api/search/filters"
```

## 📊 评分算法

### 基础搜索评分
- **精确缩写匹配：** 100分 (如 "PHQ-9" 完全匹配)
- **标题完全匹配：** 95分  
- **标题部分匹配：** 80分
- **描述匹配：** 60分
- **其他字段匹配：** 40分
- **使用频率加权：** +0.1 × 使用次数 (最大+20分)

### 语义搜索评分
- **精确缩写匹配：** 100分
- **标题匹配：** 80分
- **标题部分匹配：** 60分  
- **英文标题匹配：** 50分
- **描述匹配：** 30分
- **使用频率加权：** +0.1 × 使用次数 (最大+10分)
- **验证状态加权：** +5分 (已验证量表)

## 🚀 性能指标

| API | 平均响应时间 | 并发支持 | 缓存策略 |
|-----|-------------|----------|----------|
| 基础搜索 | 400ms | 30 req/min | 查询缓存 |
| 语义搜索 | 450ms | 20 req/min | 扩展词缓存 |
| 搜索建议 | 200ms | 60 req/min | 结果缓存 |
| 筛选选项 | 300ms | 无限制 | 长期缓存 |

## 🔒 限流规则

- **基础搜索：** 每分钟30次
- **语义搜索：** 每分钟20次  
- **搜索建议：** 每分钟60次
- **筛选选项：** 无限制
- **未登录用户：** 每日10次搜索限制

## ❌ 错误处理

### 常见错误码
```json
// 400 - 请求参数错误
{
  "error": "Invalid request parameters",
  "details": [
    {
      "code": "too_small",
      "minimum": 1, 
      "path": ["query"]
    }
  ]
}

// 429 - 超出限流
{
  "error": "Rate limit exceeded. Try again in 2 minutes."
}

// 500 - 服务器错误  
{
  "error": "Internal server error"
}
```

## 📝 使用最佳实践

### 1. 查询优化
```typescript
// ✅ 推荐：使用具体的量表缩写
{ "query": "PHQ-9" }

// ✅ 推荐：使用语义搜索处理自然语言  
{ "query": "抑郁症筛查工具" } // 使用 /api/search/semantic

// ❌ 避免：过于宽泛的查询
{ "query": "量表" }
```

### 2. 筛选组合
```typescript
// ✅ 推荐：组合多个筛选条件
{
  "query": "depression",
  "filters": {
    "validationStatus": "validated",
    "languages": ["zh-CN"],
    "administrationTimeMax": 10
  }
}
```

### 3. 分页处理
```typescript
// ✅ 推荐：合理的分页大小
{ "page": 1, "limit": 20 }

// ❌ 避免：过大的分页
{ "page": 1, "limit": 100 } // 超出限制
```

---

**API 版本：** v1.0  
**最后更新：** 2025-09-20  
**支持联系：** 开发团队  
**状态：** ✅ 生产就绪