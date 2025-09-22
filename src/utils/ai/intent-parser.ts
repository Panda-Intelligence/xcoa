// AI对话式搜索的意图解析引擎
// 支持自然语言查询如"帮我找适合老年抑郁患者的量表"

export interface QueryIntent {
  intent: 'find_scale' | 'compare_scales' | 'get_info' | 'unknown';
  confidence: number;
  entities: {
    condition?: string[];      // 疾病/症状
    population?: string[];     // 目标人群
    scaleType?: string[];      // 量表类型
    context?: string[];        // 使用场景
    requirements?: string[];   // 特殊要求
  };
  originalQuery: string;
  processedQuery: string;
}

// 领域实体字典
const DOMAIN_ENTITIES = {
  // 疾病/症状关键词
  conditions: {
    depression: ['抑郁', '抑郁症', 'depression', '情绪低落', '心情不好'],
    anxiety: ['焦虑', '焦虑症', 'anxiety', '紧张', '担忧', '恐慌'],
    pain: ['疼痛', 'pain', '痛苦', '疼', '不适'],
    cancer: ['癌症', 'cancer', '肿瘤', '恶性肿瘤', '化疗'],
    cognitive: ['认知', 'cognitive', '记忆', '智力', '痴呆', 'dementia'],
    quality_of_life: ['生活质量', 'quality of life', 'QOL', '生活', '功能']
  },
  
  // 目标人群
  populations: {
    elderly: ['老年', '老人', 'elderly', '老年人', '65岁以上'],
    adult: ['成年', '成人', 'adult', '18岁以上'],
    pediatric: ['儿童', '小儿', 'pediatric', 'children', '未成年'],
    cancer_patients: ['癌症患者', 'cancer patients', '肿瘤患者'],
    outpatients: ['门诊', 'outpatient', '门诊患者']
  },
  
  // 量表类型
  scaleTypes: {
    screening: ['筛查', 'screening', '筛选', '初筛'],
    diagnostic: ['诊断', 'diagnostic', '确诊'],
    assessment: ['评估', 'assessment', '评价', '测评'],
    monitoring: ['监测', 'monitoring', '随访', '跟踪']
  },
  
  // 使用场景
  contexts: {
    clinical_trial: ['临床试验', 'clinical trial', '临床研究', 'RCT'],
    clinical_practice: ['临床实践', 'clinical practice', '临床', '医院'],
    research: ['研究', 'research', '科研', '学术'],
    education: ['教学', 'education', '培训', '学习']
  },
  
  // 特殊要求
  requirements: {
    chinese: ['中文', '中文版', 'chinese', '汉语'],
    english: ['英文', '英文版', 'english'],
    short: ['简短', '简单', 'short', '快速', '简版'],
    free: ['免费', 'free', '公开', '无费用'],
    validated: ['验证', 'validated', '标准化', '权威']
  }
};

// 意图识别规则
const INTENT_PATTERNS = {
  find_scale: [
    /帮我找.*量表/,
    /需要.*评估.*工具/,
    /推荐.*量表/,
    /适合.*的.*量表/,
    /find.*scale/i,
    /recommend.*tool/i,
    /suitable.*assessment/i
  ],
  compare_scales: [
    /比较.*量表/,
    /.*和.*的区别/,
    /哪个更好/,
    /compare.*scales/i,
    /difference.*between/i
  ],
  get_info: [
    /.*是什么/,
    /.*怎么用/,
    /.*如何评分/,
    /what.*is/i,
    /how.*to.*use/i
  ]
};

// 主要解析函数
export function parseQueryIntent(query: string): QueryIntent {
  const normalizedQuery = query.toLowerCase().trim();
  
  // 1. 识别意图
  let intent: QueryIntent['intent'] = 'unknown';
  let maxConfidence = 0;
  
  for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedQuery)) {
        const confidence = calculatePatternConfidence(pattern, normalizedQuery);
        if (confidence > maxConfidence) {
          intent = intentType as QueryIntent['intent'];
          maxConfidence = confidence;
        }
      }
    }
  }
  
  // 2. 提取实体
  const entities = extractEntities(normalizedQuery);
  
  // 3. 计算总体置信度
  const finalConfidence = Math.min(maxConfidence + (Object.keys(entities).length * 0.1), 1.0);
  
  return {
    intent,
    confidence: finalConfidence,
    entities,
    originalQuery: query,
    processedQuery: normalizedQuery
  };
}

// 实体提取函数
function extractEntities(query: string) {
  const entities: QueryIntent['entities'] = {};
  
  // 提取疾病/症状
  for (const [condition, keywords] of Object.entries(DOMAIN_ENTITIES.conditions)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        entities.condition = entities.condition || [];
        if (!entities.condition.includes(condition)) {
          entities.condition.push(condition);
        }
      }
    }
  }
  
  // 提取人群
  for (const [population, keywords] of Object.entries(DOMAIN_ENTITIES.populations)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        entities.population = entities.population || [];
        if (!entities.population.includes(population)) {
          entities.population.push(population);
        }
      }
    }
  }
  
  // 提取量表类型
  for (const [scaleType, keywords] of Object.entries(DOMAIN_ENTITIES.scaleTypes)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        entities.scaleType = entities.scaleType || [];
        if (!entities.scaleType.includes(scaleType)) {
          entities.scaleType.push(scaleType);
        }
      }
    }
  }
  
  // 提取使用场景
  for (const [context, keywords] of Object.entries(DOMAIN_ENTITIES.contexts)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        entities.context = entities.context || [];
        if (!entities.context.includes(context)) {
          entities.context.push(context);
        }
      }
    }
  }
  
  // 提取特殊要求
  for (const [requirement, keywords] of Object.entries(DOMAIN_ENTITIES.requirements)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        entities.requirements = entities.requirements || [];
        if (!entities.requirements.includes(requirement)) {
          entities.requirements.push(requirement);
        }
      }
    }
  }
  
  return entities;
}

// 模式匹配置信度计算
function calculatePatternConfidence(pattern: RegExp, query: string): number {
  const match = query.match(pattern);
  if (!match) return 0;
  
  // 基于匹配长度和查询长度计算置信度
  const matchLength = match[0].length;
  const queryLength = query.length;
  
  return Math.min(matchLength / queryLength + 0.3, 1.0);
}

// 生成搜索建议
export function generateSearchSuggestions(intent: QueryIntent): string[] {
  const suggestions: string[] = [];
  
  if (intent.entities.condition?.includes('depression')) {
    suggestions.push(
      '适合临床试验的抑郁量表',
      '老年抑郁筛查工具',
      '简短的抑郁评估量表'
    );
  }
  
  if (intent.entities.condition?.includes('anxiety')) {
    suggestions.push(
      '焦虑症筛查量表推荐',
      '广泛性焦虑评估工具',
      '儿童焦虑量表'
    );
  }
  
  if (intent.entities.condition?.includes('pain')) {
    suggestions.push(
      '疼痛强度评估量表',
      '癌症疼痛评估工具',
      '慢性疼痛功能评估'
    );
  }
  
  return suggestions.slice(0, 5); // 最多返回5个建议
}