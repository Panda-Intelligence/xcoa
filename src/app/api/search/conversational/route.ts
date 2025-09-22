import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { like, or, and, sql } from 'drizzle-orm';
import { parseQueryIntent, generateSearchSuggestions } from '@/utils/ai/intent-parser';
import { z } from 'zod';

const conversationalSearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10),
  includeExplanation: z.boolean().optional().default(true)
});

// 领域到量表的映射
const DOMAIN_SCALE_MAPPING = {
  depression: {
    primary: ['PHQ-9', 'BDI-II', 'HAM-D'],
    elderly: ['GDS', 'PHQ-9'],
    screening: ['PHQ-2', 'PHQ-9'],
    clinical_trial: ['HAM-D', 'MADRS', 'PHQ-9']
  },
  anxiety: {
    primary: ['GAD-7', 'BAI', 'HAM-A'],
    generalized: ['GAD-7'],
    panic: ['PDSS', 'PAS'],
    social: ['SPIN', 'SPS']
  },
  pain: {
    primary: ['BPI', 'VAS', 'NRS'],
    cancer: ['BPI', 'EORTC QLQ-C30'],
    chronic: ['BPI', 'MPQ'],
    pediatric: ['FACES', 'FLACC']
  },
  quality_of_life: {
    primary: ['SF-36', 'WHOQOL-BREF'],
    cancer: ['EORTC QLQ-C30', 'FACT-G'],
    elderly: ['WHOQOL-OLD'],
    generic: ['SF-36', 'EQ-5D-5L']
  },
  cognitive: {
    primary: ['MMSE-2', 'MoCA'],
    screening: ['MMSE-2', 'ACE-III'],
    dementia: ['CDR', 'ADAS-Cog'],
    elderly: ['MMSE-2', 'MoCA']
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit, includeExplanation } = conversationalSearchSchema.parse(body);
    
    console.log('AI搜索查询:', query);
    
    // 1. 解析用户意图
    const intent = parseQueryIntent(query);
    console.log('解析意图:', intent);
    
    if (intent.confidence < 0.3) {
      return NextResponse.json({
        success: false,
        message: '抱歉，我没有理解您的查询。请尝试更具体的描述，比如"帮我找适合老年患者的抑郁量表"',
        suggestions: [
          '帮我找适合老年患者的抑郁量表',
          '需要评估癌症患者生活质量的工具',
          '临床试验常用的焦虑评估量表'
        ]
      });
    }
    
    // 2. 基于意图生成搜索策略
    const searchStrategy = generateSearchStrategy(intent);
    console.log('搜索策略:', searchStrategy);
    
    // 3. 执行智能搜索
    const db = getDB();
    const results = await executeIntelligentSearch(db, searchStrategy, limit);
    
    // 4. 生成推荐解释
    const explanation = includeExplanation ? generateExplanation(intent, results) : null;
    
    // 5. 生成相关搜索建议
    const suggestions = generateSearchSuggestions(intent);
    
    return NextResponse.json({
      success: true,
      intent: {
        understood: intent,
        confidence: intent.confidence
      },
      results: results.map(result => ({
        ...result,
        aiScore: calculateAIScore(result, intent),
        matchReason: generateMatchReason(result, intent)
      })),
      explanation,
      suggestions,
      totalResults: results.length
    });
    
  } catch (error) {
    console.error('AI搜索错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '查询参数无效', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '搜索处理失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 生成搜索策略
function generateSearchStrategy(intent: QueryIntent) {
  const strategy = {
    primaryConditions: intent.entities.condition || [],
    targetPopulations: intent.entities.population || [],
    preferredTypes: intent.entities.scaleType || [],
    contextRequirements: intent.entities.context || [],
    specialRequirements: intent.entities.requirements || []
  };
  
  return strategy;
}

// 执行智能搜索
async function executeIntelligentSearch(db: any, strategy: any, limit: number) {
  // 构建智能查询条件
  const conditions = [];
  
  // 基于疾病条件搜索
  if (strategy.primaryConditions.length > 0) {
    const conditionQueries = strategy.primaryConditions.map(condition => 
      or(
        like(ecoaScaleTable.name, `%${condition}%`),
        like(ecoaScaleTable.description, `%${condition}%`),
        like(ecoaScaleTable.acronym, `%${condition.toUpperCase()}%`)
      )
    );
    conditions.push(or(...conditionQueries));
  }
  
  // 基于分类搜索
  const categoryConditions = [];
  if (strategy.primaryConditions.includes('depression') || strategy.primaryConditions.includes('anxiety')) {
    categoryConditions.push(like(ecoaCategoryTable.name, '%抑郁%'));
    categoryConditions.push(like(ecoaCategoryTable.name, '%焦虑%'));
  }
  if (strategy.primaryConditions.includes('cognitive')) {
    categoryConditions.push(like(ecoaCategoryTable.name, '%认知%'));
  }
  if (strategy.primaryConditions.includes('quality_of_life')) {
    categoryConditions.push(like(ecoaCategoryTable.name, '%生活质量%'));
  }
  if (strategy.primaryConditions.includes('pain')) {
    categoryConditions.push(like(ecoaCategoryTable.name, '%疼痛%'));
  }
  
  if (categoryConditions.length > 0) {
    conditions.push(or(...categoryConditions));
  }
  
  // 执行查询
  const query = db
    .select({
      id: ecoaScaleTable.id,
      name: ecoaScaleTable.name,
      nameEn: ecoaScaleTable.nameEn,
      acronym: ecoaScaleTable.acronym,
      description: ecoaScaleTable.description,
      descriptionEn: ecoaScaleTable.descriptionEn,
      categoryName: ecoaCategoryTable.name,
      itemsCount: ecoaScaleTable.itemsCount,
      administrationTime: ecoaScaleTable.administrationTime,
      targetPopulation: ecoaScaleTable.targetPopulation,
      validationStatus: ecoaScaleTable.validationStatus,
      usageCount: ecoaScaleTable.usageCount,
      favoriteCount: ecoaScaleTable.favoriteCount
    })
    .from(ecoaScaleTable)
    .leftJoin(ecoaCategoryTable, sql`${ecoaScaleTable.categoryId} = ${ecoaCategoryTable.id}`);
  
  if (conditions.length > 0) {
    query.where(or(...conditions));
  }
  
  const results = await query
    .orderBy(sql`${ecoaScaleTable.usageCount} DESC`)
    .limit(limit);
  
  return results;
}

// 计算AI匹配分数
function calculateAIScore(result: any, intent: QueryIntent): number {
  let score = 0.5; // 基础分
  
  // 基于疾病匹配度
  if (intent.entities.condition) {
    for (const condition of intent.entities.condition) {
      if (result.name.includes(condition) || result.description.includes(condition)) {
        score += 0.3;
      }
    }
  }
  
  // 基于人群匹配度
  if (intent.entities.population) {
    for (const population of intent.entities.population) {
      if (result.targetPopulation?.includes(population)) {
        score += 0.2;
      }
    }
  }
  
  // 基于使用频率
  const usageBonus = Math.min((result.usageCount || 0) / 100, 0.2);
  score += usageBonus;
  
  return Math.min(score, 1.0);
}

// 生成匹配原因
function generateMatchReason(result: any, intent: QueryIntent): string {
  const reasons = [];
  
  if (intent.entities.condition) {
    for (const condition of intent.entities.condition) {
      if (result.description?.includes(condition)) {
        reasons.push(`专门用于${condition}评估`);
      }
    }
  }
  
  if (intent.entities.population) {
    for (const population of intent.entities.population) {
      if (result.targetPopulation?.includes(population)) {
        reasons.push(`适合${population}群体`);
      }
    }
  }
  
  if (result.validationStatus === 'validated') {
    reasons.push('已验证的标准化量表');
  }
  
  if (result.usageCount > 50) {
    reasons.push('临床广泛使用');
  }
  
  return reasons.join(' | ') || '相关量表';
}

// 生成解释
function generateExplanation(intent: QueryIntent, results: any[]): string {
  if (results.length === 0) {
    return '很抱歉，没有找到完全匹配您需求的量表。建议您调整搜索条件或联系专业人员获取建议。';
  }
  
  const conditions = intent.entities.condition?.join('、') || '';
  const populations = intent.entities.population?.join('、') || '';
  
  let explanation = '基于您的查询';
  
  if (conditions) {
    explanation += `，我为您找到了${conditions}相关的`;
  }
  
  if (populations) {
    explanation += `适合${populations}的`;
  }
  
  explanation += `量表。推荐使用排名靠前的量表，它们在临床和研究中有较好的验证和应用记录。`;
  
  if (results.length > 3) {
    explanation += `\n\n前三个结果是最相关的选择，其他选项可作为备选方案。`;
  }
  
  return explanation;
}