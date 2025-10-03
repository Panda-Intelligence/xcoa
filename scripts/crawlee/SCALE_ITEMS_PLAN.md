# 量表 Items 补充完整计划

## 目标
为已导入的 328 个量表补充完整的 items（条目）数据

## 数据结构分析

### ecoa_item 表结构
- `id`: TEXT (主键)
- `scaleId`: TEXT (外键关联 ecoa_scale)
- `itemNumber`: INTEGER (条目编号)
- `question`: TEXT(1000) (问题文本，必填)
- `questionEn`: TEXT(1000) (英文问题文本)
- `dimension`: TEXT(255) (维度/类别)
- `responseType`: TEXT(50) (响应类型：likert, yes_no, multiple_choice等)
- `responseOptions`: TEXT (响应选项，JSON格式)
- `scoringInfo`: TEXT(500) (计分信息)
- `isRequired`: INTEGER (是否必填)
- `sortOrder`: INTEGER (排序)

### 已有量表数据
- 328 个量表已导入 ecoa_scale 表
- ID 格式：数字（如 751, 753）
- 来源：www.usecoa.com/?p={id}

## 实施计划

### 阶段 1: 网页结构分析 ✅
1. 手动访问几个量表页面，分析 HTML 结构
2. 识别 items 的选择器规则
3. 确定数据提取模式

### 阶段 2: 爬虫脚本开发
1. 基于现有的 `html.ts` 扩展
2. 对每个量表：
   - 访问详情页面
   - 提取 items 数据（题目、选项、维度等）
   - 保存到 JSON 文件

### 阶段 3: 数据清洗和验证
1. 解析 JSON 数据
2. 验证必填字段
3. 标准化响应类型
4. 处理特殊字符和格式

### 阶段 4: SQL 生成
1. 为每个 item 生成唯一 ID
2. 创建批量 INSERT 语句
3. 处理外键关联

### 阶段 5: 数据导入
1. 先导入小批量测试
2. 验证关联关系
3. 全量导入
4. 更新 ecoa_scale 的 itemsCount 字段

### 阶段 6: 验证
1. 检查数据完整性
2. 验证统计数据
3. 测试前端展示

## 技术细节

### 爬虫配置
```typescript
{
  maxRequestsPerCrawl: 350, // 328 scales + buffer
  requestHandlerTimeoutSecs: 120,
  maxConcurrency: 2, // 控制并发避免被封
  requestDelay: 2000, // 2秒延迟
}
```

### 数据提取策略
1. **条目编号**: 从序号提取
2. **问题文本**: 从题目区域提取
3. **响应类型**: 根据选项格式推断（Likert量表、是非题等）
4. **响应选项**: 提取所有选项并JSON化
5. **维度**: 从分组标题提取

### 错误处理
- 页面404: 记录并跳过
- 解析失败: 记录错误，保存原始HTML
- 部分数据缺失: 使用默认值

## 数据质量控制

### 必填字段验证
- scaleId 必须存在于 ecoa_scale
- question 不能为空
- itemNumber 必须唯一（同一量表内）
- responseType 必须有效

### 数据一致性
- 同一量表的 items 按 itemNumber 排序
- dimension 命名统一
- responseOptions JSON 格式正确

## 预估工作量
- 网页分析: 2-3 小时
- 爬虫开发: 4-6 小时
- 数据清洗: 3-4 小时
- 导入验证: 2-3 小时
- **总计**: 11-16 小时

## 下一步行动
1. [ ] 手动检查 5-10 个量表页面的 HTML 结构
2. [ ] 编写爬虫脚本 `scale-items-crawler.ts`
3. [ ] 小规模测试（10 个量表）
4. [ ] 全量爬取
5. [ ] 生成 SQL 并导入
