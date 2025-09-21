-- 快速插入PHQ-9题目数据（解决交互模式无题目问题）
-- 2025-09-21 紧急修复

-- 检查PHQ-9量表是否存在
INSERT OR IGNORE INTO ecoa_scale (
  id, name, name_en, acronym, description, category_id, items_count,
  administration_time, target_population, validation_status,
  created_at, updated_at
) VALUES (
  'scale_phq9',
  '患者健康问卷-9',
  'Patient Health Questionnaire-9', 
  'PHQ-9',
  'PHQ-9是一个广泛使用的抑郁症筛查和严重程度评估工具',
  'cat_01',
  9,
  5,
  '成年人抑郁症筛查',
  'validated',
  datetime('now'),
  datetime('now')
);

-- 删除可能存在的PHQ-9题目数据
DELETE FROM ecoa_item WHERE scale_id = 'scale_phq9';

-- 插入PHQ-9完整9题项
INSERT INTO ecoa_item (
  id, scale_id, item_number, question, question_en, dimension,
  response_type, response_options, scoring_info, is_required, sort_order,
  created_at, updated_at
) VALUES

('item_phq9_01', 'scale_phq9', 1, '做事时提不起劲或没有兴趣', 'Little interest or pleasure in doing things', '核心症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 1, datetime('now'), datetime('now')),

('item_phq9_02', 'scale_phq9', 2, '感到心情低落、沮丧或绝望', 'Feeling down, depressed, or hopeless', '核心症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 2, datetime('now'), datetime('now')),

('item_phq9_03', 'scale_phq9', 3, '入睡困难、睡不安稳或睡眠过多', 'Trouble falling or staying asleep, or sleeping too much', '躯体症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 3, datetime('now'), datetime('now')),

('item_phq9_04', 'scale_phq9', 4, '感觉疲倦或没有活力', 'Feeling tired or having little energy', '躯体症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 4, datetime('now'), datetime('now')),

('item_phq9_05', 'scale_phq9', 5, '食欲不振或吃太多', 'Poor appetite or overeating', '躯体症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 5, datetime('now'), datetime('now')),

('item_phq9_06', 'scale_phq9', 6, '觉得自己很糟糕，或觉得自己很失败，或让自己或家人失望', 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down', '认知症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 6, datetime('now'), datetime('now')),

('item_phq9_07', 'scale_phq9', 7, '对事物专注有困难，例如阅读报纸或看电视时', 'Trouble concentrating on things, such as reading the newspaper or watching television', '认知症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 7, datetime('now'), datetime('now')),

('item_phq9_08', 'scale_phq9', 8, '动作或说话速度缓慢到别人已经察觉？或正好相反—烦躁或坐立不安，动来动去的情况超过平常', 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual', '躯体症状', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 8, datetime('now'), datetime('now')),

('item_phq9_09', 'scale_phq9', 9, '有不如死掉或用某种方式伤害自己的想法', 'Thoughts that you would be better off dead, or of hurting yourself in some way', '自杀风险', 'likert', '["完全不会", "有几天", "一半以上的天数", "几乎每天"]', '0-3分', 1, 9, datetime('now'), datetime('now'));

-- 更新PHQ-9量表信息
UPDATE ecoa_scale 
SET 
  items_count = 9,
  languages = '["zh-CN", "en-US"]',
  domains = '["核心症状", "躯体症状", "认知症状", "自杀风险"]',
  psychometric_properties = '{
    "reliability": {"cronbachAlpha": 0.89, "testRetest": 0.84},
    "validity": {"sensitivity": 0.88, "specificity": 0.88},
    "cutoffScores": {"minimal": 0, "mild": 5, "moderate": 10, "moderatelySerere": 15, "severe": 20}
  }',
  scoring_method = '4点李克特量表评分，总分0-27分。0-4分：最小抑郁；5-9分：轻度抑郁；10-14分：中度抑郁；15-19分：中重度抑郁；20-27分：重度抑郁。',
  updated_at = datetime('now')
WHERE id = 'scale_phq9';

-- 验证插入结果
SELECT 
  s.acronym,
  s.name,
  s.items_count as expected_count,
  COUNT(i.id) as actual_count,
  GROUP_CONCAT(i.item_number) as item_numbers
FROM ecoa_scale s
LEFT JOIN ecoa_item i ON s.id = i.scale_id
WHERE s.acronym = 'PHQ-9'
GROUP BY s.id;