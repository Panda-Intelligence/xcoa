-- GAD-7 广泛性焦虑障碍量表 完整题项数据
-- 2025-09-21 数据补充

-- 清除可能存在的GAD-7题项数据
DELETE FROM ecoa_item WHERE scale_id IN (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7');

-- 插入GAD-7完整题项数据
INSERT INTO ecoa_item (
  id, scale_id, item_number, question, question_en, dimension, 
  response_type, response_options, scoring_info, is_required, sort_order, 
  created_at, updated_at
) VALUES

-- 题项1
('item_gad7_01', 
 (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7'), 
 1,
 '感到紧张、焦虑或急躁',
 'Feeling nervous, anxious, or on edge',
 '核心焦虑症状',
 'likert',
 '["完全不会", "有几天", "一半以上的天数", "几乎每天"]',
 '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
 1,
 1,
 datetime('now'),
 datetime('now')),

-- 题项2  
('item_gad7_02',
 (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7'),
 2,
 '无法停止或控制担忧',
 'Not being able to stop or control worrying',
 '担忧控制',
 'likert',
 '["完全不会", "有几天", "一半以上的天数", "几乎每天"]',
 '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
 1,
 2,
 datetime('now'),
 datetime('now')),

-- 题项3
('item_gad7_03',
 (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7'),
 3,
 '对很多不同的事情过分担忧',
 'Worrying too much about different things',
 '过度担忧',
 'likert',
 '["完全不会", "有几天", "一半以上的天数", "几乎每天"]',
 '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
 1,
 3,
 datetime('now'),
 datetime('now')),

-- 题项4
('item_gad7_04',
 (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7'),
 4,
 '很难放松下来',
 'Trouble relaxing',
 '躯体紧张',
 'likert',
 '["完全不会", "有几天", "一半以上的天数", "几乎每天"]',
 '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
 1,
 4,
 datetime('now'),
 datetime('now')),

-- 题项5
('item_gad7_05',
 (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7'),
 5,
 '坐立不安，难以安静地坐着',
 'Being so restless that it\'s hard to sit still',
 '运动性不安',
 'likert',
 '["完全不会", "有几天", "一半以上的天数", "几乎每天"]',
 '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
 1,
 5,
 datetime('now'),
 datetime('now')),

-- 题项6
('item_gad7_06',
 (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7'),
 6,
 '变得容易烦恼或急躁',
 'Becoming easily annoyed or irritable',
 '易激惹',
 'likert',
 '["完全不会", "有几天", "一半以上的天数", "几乎每天"]',
 '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
 1,
 6,
 datetime('now'),
 datetime('now')),

-- 题项7
('item_gad7_07',
 (SELECT id FROM ecoa_scale WHERE acronym = 'GAD-7'),
 7,
 '感到好像有什么可怕的事要发生',
 'Feeling afraid as if something awful might happen',
 '恐惧感',
 'likert',
 '["完全不会", "有几天", "一半以上的天数", "几乎每天"]',
 '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
 1,
 7,
 datetime('now'),
 datetime('now'));

-- 更新GAD-7量表的心理测量属性
UPDATE ecoa_scale 
SET psychometric_properties = '{
  "reliability": {
    "cronbachAlpha": 0.92,
    "testRetest": 0.83,
    "interRater": "不适用"
  },
  "validity": {
    "sensitivity": 0.89,
    "specificity": 0.82,
    "constructValidity": "良好"
  },
  "cutoffScores": {
    "minimal": 0,
    "mild": 5,
    "moderate": 10,
    "severe": 15
  }
}',
scoring_method = '4点李克特量表评分，总分0-21分。0-4分：最小焦虑；5-9分：轻度焦虑；10-14分：中度焦虑；15-21分：重度焦虑。切分值：10分为临床焦虑的推荐切分点。'
WHERE acronym = 'GAD-7';

-- 更新使用统计数据（模拟真实使用）
UPDATE ecoa_scale 
SET 
  usage_count = 89,
  favorite_count = 23,
  updated_at = datetime('now')
WHERE acronym = 'GAD-7';

-- 验证数据插入
SELECT 
  s.name as scale_name,
  s.acronym,
  COUNT(i.id) as item_count,
  s.items_count as expected_count
FROM ecoa_scale s
LEFT JOIN ecoa_item i ON s.id = i.scale_id
WHERE s.acronym = 'GAD-7'
GROUP BY s.id;