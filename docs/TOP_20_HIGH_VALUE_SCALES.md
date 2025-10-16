# Top 20 高价值量表清单 - 优先手动录入items

## 选择标准
1. **临床使用频率高** - 在医院、诊所广泛使用
2. **开源或学术免费** - 可合法获取完整题目
3. **中英文版本齐全** - 便于国际化
4. **信效度良好** - 有充分的心理测量学证据

## 分类清单

### A. 抑郁焦虑类 (7个) ✅

| # | 量表 | 缩写 | 题目数 | 优先级 | 状态 | 来源 |
|---|------|------|--------|--------|------|------|
| 1 | ✅ Patient Health Questionnaire-9 | PHQ-9 | 9 | 🔴 P0 | ✅ 已完成 | 已有SQL |
| 2 | ✅ Generalized Anxiety Disorder-7 | GAD-7 | 7 | 🔴 P0 | ✅ 已完成 | 已有SQL |
| 3 | Beck Depression Inventory-II | BDI-II | 21 | 🔴 P0 | ⏳ 待录入 | 官方PDF/论文附录 |
| 4 | Hospital Anxiety and Depression Scale | HADS | 14 | 🔴 P0 | ⏳ 待录入 | 官方网站免费 |
| 5 | Beck Anxiety Inventory | BAI | 21 | 🟡 P1 | ⏳ 待录入 | 学术论文 |
| 6 | Hamilton Anxiety Rating Scale | HAM-A | 14 | 🟡 P1 | ⏳ 待录入 | 公开资料 |
| 7 | Zung Self-Rating Depression Scale | SDS | 20 | 🟡 P1 | ⏳ 待录入 | 公开资料 |

### B. 生活质量类 (4个) ✅

| # | 量表 | 缩写 | 题目数 | 优先级 | 状态 | 来源 |
|---|------|------|--------|--------|------|------|
| 8 | Short Form-36 Health Survey | SF-36 | 36 | 🔴 P0 | ⏳ 待录入 | 官方授权中文版 |
| 9 | WHO Quality of Life-BREF | WHOQOL-BREF | 26 | 🔴 P0 | ⏳ 待录入 | WHO官方 |
| 10 | EQ-5D-5L | EQ-5D | 5 | 🟡 P1 | ⏳ 待录入 | EuroQol官网 |
| 11 | Pittsburgh Sleep Quality Index | PSQI | 19 | 🟡 P1 | ⏳ 待录入 | 学术论文 |

### C. 认知评估类 (3个) ✅

| # | 量表 | 缩写 | 题目数 | 优先级 | 状态 | 来源 |
|---|------|------|--------|--------|------|------|
| 12 | ✅ Mini-Mental State Examination-2 | MMSE-2 | 30 | 🔴 P0 | ✅ 已完成 | 已有SQL |
| 13 | Montreal Cognitive Assessment | MoCA | 30 | 🔴 P0 | ⏳ 待录入 | 官方网站免费 |
| 14 | Clock Drawing Test | CDT | 1 | 🟢 P2 | ⏳ 待录入 | 标准化版本 |

### D. 人格评估类 (3个) ✅

| # | 量表 | 缩写 | 题目数 | 优先级 | 状态 | 来源 |
|---|------|------|--------|--------|------|------|
| 15 | Big Five Inventory | BFI-44 | 44 | 🟡 P1 | ⏳ 待录入 | IPIP开源 |
| 16 | Eysenck Personality Questionnaire | EPQ | 88 | 🟢 P2 | ⏳ 待录入 | 学术论文 |
| 17 | NEO Five-Factor Inventory | NEO-FFI | 60 | 🟢 P2 | ⏳ 待录入 | 授权版本 |

### E. 临床症状类 (3个) ✅

| # | 量表 | 缩写 | 题目数 | 优先级 | 状态 | 来源 |
|---|------|------|--------|--------|------|------|
| 18 | Positive and Negative Syndrome Scale | PANSS | 30 | 🟡 P1 | ⏳ 待录入 | 学术论文 |
| 19 | Young Mania Rating Scale | YMRS | 11 | 🟡 P1 | ⏳ 待录入 | 学术论文 |
| 20 | Brief Psychiatric Rating Scale | BPRS | 18 | 🟢 P2 | ⏳ 待录入 | 公开资料 |

---

## 优先级说明

- **🔴 P0 (最高)**: Week 1-2 完成 (6个)
  - BDI-II, HADS, SF-36, WHOQOL-BREF, MoCA + 已完成的3个

- **🟡 P1 (高)**: Week 3-4 完成 (6个)
  - BAI, HAM-A, SDS, EQ-5D, PSQI, BFI-44, PANSS, YMRS

- **🟢 P2 (中)**: Week 5-8 完成 (5个)
  - CDT, EPQ, NEO-FFI, BPRS + 其他

---

## 已完成的3个量表 ✅

1. ✅ PHQ-9 - `scripts/seed-phq9-items.sql` (9题)
2. ✅ GAD-7 - `scripts/seed-gad7-items.sql` (7题)
3. ✅ MMSE-2 - `scripts/seed-mmse2-items.sql` (30题)

---

## 第一批待录入 (Week 1-2目标: 5个)

### 立即开始录入 (按优先级):

1. **BDI-II** (Beck Depression Inventory-II) - 21题
   - 来源: https://www.apa.org/ 或学术论文附录
   - 特点: 抑郁症状评估金标准

2. **HADS** (Hospital Anxiety and Depression Scale) - 14题
   - 来源: https://www.gl-assessment.co.uk/ 或学术使用版
   - 特点: 医院环境常用

3. **SF-36** (Short Form-36) - 36题
   - 来源: RAND Corporation免费版本
   - 特点: 生活质量评估标准

4. **MoCA** (Montreal Cognitive Assessment) - 30题
   - 来源: https://www.mocatest.org/ 官方中文版
   - 特点: 认知筛查标准工具

5. **WHOQOL-BREF** (WHO生活质量简表) - 26题
   - 来源: WHO官方网站
   - 特点: 国际标准生活质量量表

---

## 数据获取策略

### 1. 官方网站（首选）
- MoCA: https://www.mocatest.org/
- WHOQOL: https://www.who.int/tools/whoqol
- SF-36: https://www.rand.org/health-care/surveys_tools/mos/36-item-short-form.html

### 2. 学术论文附录（次选）
- PubMed Central搜索: "[量表名] validation Chinese"
- 查找Method部分或Appendix

### 3. 心理测量学数据库（补充）
- APA PsycTests (需机构订阅)
- Mental Measurements Yearbook

### 4. 开源项目（特定领域）
- IPIP: https://ipip.ori.org/ (人格量表)

---

## 录入模板

参考现有的 `scripts/seed-phq9-items.sql` 格式:

```sql
INSERT INTO ecoa_item (
  id, scaleId, itemNumber, question, questionEn, dimension,
  responseType, responseOptions, scoringInfo, isRequired, sortOrder,
  createdAt, updatedAt, updateCounter
) VALUES
('item_bdi2_01', 'scale_bdi2', 1,
 '悲伤',
 'Sadness',
 '情绪症状',
 'likert',
 '["0-我不感到悲伤", "1-我时常感到悲伤", "2-我一直很悲伤", "3-我非常悲伤或不愉快，以致不能承受"]',
 '0-3分',
 1, 1,
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);
```

---

## 工作量估算

- **每个量表录入时间**: 2-4小时
  - 查找资料: 30-60分钟
  - 题目翻译: 30-60分钟
  - SQL编写: 30-60分钟
  - 验证测试: 30分钟

- **Week 1-2 目标**: 5个量表 = 10-20小时
- **总目标 (60个)**: 120-240小时

---

## 下一步行动

1. ✅ 搜索 BDI-II 官方或论文附录
2. ✅ 提取21个题目和选项
3. ✅ 创建 `scripts/seed-bdi2-items.sql`
4. ✅ 导入并验证
5. ✅ 重复步骤1-4，完成HADS, SF-36, MoCA, WHOQOL-BREF

---

**创建日期**: 2025-10-14
**更新日期**: 2025-10-14
**状态**: 3/20 完成 (15%)
