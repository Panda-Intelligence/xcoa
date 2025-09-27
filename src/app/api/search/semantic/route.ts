import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  ecoaScaleTable,
  ecoaCategoryTable,
  userSearchHistoryTable,
  scaleUsageTable
} from '@/db/schema';
import { and, or, like, desc, eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const semanticSearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().min(1).max(50).default(10),
});

// 语义搜索的关键词映射和权重
const SEMANTIC_KEYWORDS = {
  // 抑郁症相关
  '抑郁': ['depression', 'depressive', 'mood', 'phq', 'beck', 'hamilton'],
  '情绪': ['mood', 'emotion', 'feeling', 'affect'],
  '心情': ['mood', 'depression', 'sadness'],

  // 焦虑症相关
  '焦虑': ['anxiety', 'gad', 'panic', 'worry', 'stress'],
  '担心': ['worry', 'anxiety', 'concern'],
  '恐慌': ['panic', 'anxiety', 'fear'],

  // 认知功能相关
  '认知': ['cognitive', 'memory', 'attention', 'executive', 'mmse', 'moca'],
  '记忆': ['memory', 'cognitive', 'recall', 'recognition'],
  '注意力': ['attention', 'concentration', 'focus'],
  '痴呆': ['dementia', 'alzheimer', 'cognitive', 'mmse'],

  // 生活质量相关
  '生活质量': ['quality of life', 'qol', 'functioning', 'wellbeing', 'sf-36', 'eortc'],
  '功能': ['function', 'functioning', 'disability', 'activity'],
  '健康': ['health', 'wellbeing', 'wellness'],

  // 疼痛相关
  '疼痛': ['pain', 'ache', 'discomfort', 'neuropathic'],
  '疼': ['pain', 'ache'],

  // 症状筛查
  '筛查': ['screening', 'assessment', 'evaluation', 'scale'],
  '评估': ['assessment', 'evaluation', 'measure', 'scale'],
  '量表': ['scale', 'questionnaire', 'inventory', 'assessment'],
};

// 扩展查询词汇，添加语义相关词汇
function expandQuery(query: string): string[] {
  const expandedTerms = [query.toLowerCase()];

  // 检查是否包含语义关键词
  for (const [chinese, englishTerms] of Object.entries(SEMANTIC_KEYWORDS)) {
    if (query.includes(chinese)) {
      expandedTerms.push(...englishTerms);
    }
  }

  // 处理常见缩写
  const abbreviations: Record<string, string[]> = {
    'phq': ['patient health questionnaire', '患者健康问卷'],
    'gad': ['generalized anxiety disorder', '广泛性焦虑障碍'],
    'mmse': ['mini mental state examination', '简易精神状态检查'],
    'sf': ['short form', '简明'],
    'eortc': ['european organisation research treatment cancer', '欧洲癌症'],
  };

  for (const [abbr, expansions] of Object.entries(abbreviations)) {
    if (query.toLowerCase().includes(abbr)) {
      expandedTerms.push(...expansions);
    }
  }

  return [...new Set(expandedTerms)]; // 去重
}

// 计算语义匹配分数
function calculateSemanticScore(scale: any, queryTerms: string[]): number {
  let score = 0;
  const content = [
    scale.name || '',
    scale.nameEn || '',
    scale.acronym || '',
    scale.description || '',
    scale.descriptionEn || '',
    scale.targetPopulation || '',
    JSON.stringify(scale.domains || [])
  ].join(' ').toLowerCase();

  queryTerms.forEach(term => {
    const termLower = term.toLowerCase();

    // 精确匹配缩写获得最高分
    if (scale.acronym && scale.acronym.toLowerCase() === termLower) {
      score += 100;
    }
    // 标题完全匹配
    else if (scale.name && scale.name.toLowerCase() === termLower) {
      score += 80;
    }
    // 标题部分匹配
    else if (scale.name && scale.name.toLowerCase().includes(termLower)) {
      score += 60;
    }
    // 英文标题匹配
    else if (scale.nameEn && scale.nameEn.toLowerCase().includes(termLower)) {
      score += 50;
    }
    // 描述匹配
    else if (content.includes(termLower)) {
      score += 30;
    }
  });

  // 基于使用频率的加权
  score += Math.min((scale.usageCount || 0) * 0.1, 10);

  // 基于验证状态的加权
  if (scale.validationStatus === 'validated') {
    score += 5;
  }

  return score;
}

export async function POST(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;
      const ip = getIP(request);

      const body = await request.json();
      const { query, limit } = semanticSearchRequestSchema.parse(body);

      // 扩展查询词汇
      const expandedTerms = expandQuery(query);

      // 构建搜索条件
      const searchConditions = expandedTerms.map(term =>
        or(
          like(sql`LOWER(${ecoaScaleTable.name})`, `%${term}%`),
          like(sql`LOWER(${ecoaScaleTable.nameEn})`, `%${term}%`),
          like(sql`LOWER(${ecoaScaleTable.acronym})`, `%${term}%`),
          like(sql`LOWER(${ecoaScaleTable.description})`, `%${term}%`),
          like(sql`LOWER(${ecoaScaleTable.descriptionEn})`, `%${term}%`),
          like(sql`LOWER(${ecoaScaleTable.targetPopulation})`, `%${term}%`),
          like(sql`LOWER(${ecoaScaleTable.domains})`, `%${term}%`)
        )
      );

      // 获取所有可能匹配的量表
      const results = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          nameEn: ecoaScaleTable.nameEn,
          acronym: ecoaScaleTable.acronym,
          description: ecoaScaleTable.description,
          descriptionEn: ecoaScaleTable.descriptionEn,
          categoryId: ecoaScaleTable.categoryId,
          categoryName: ecoaCategoryTable.name,
          categoryNameEn: ecoaCategoryTable.nameEn,
          itemsCount: ecoaScaleTable.itemsCount,
          dimensionsCount: ecoaScaleTable.dimensionsCount,
          languages: ecoaScaleTable.languages,
          validationStatus: ecoaScaleTable.validationStatus,
          administrationTime: ecoaScaleTable.administrationTime,
          targetPopulation: ecoaScaleTable.targetPopulation,
          ageRange: ecoaScaleTable.ageRange,
          domains: ecoaScaleTable.domains,
          usageCount: ecoaScaleTable.usageCount,
          favoriteCount: ecoaScaleTable.favoriteCount,
        })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(
          and(
            eq(ecoaScaleTable.isPublic, 1),
            or(...searchConditions)
          )
        );

      // 计算语义匹配分数并排序
      const scoredResults = results
        .map(result => ({
          ...result,
          semantic_score: calculateSemanticScore(result, expandedTerms),
          match_score: calculateSemanticScore(result, expandedTerms),
          category: result.categoryName || result.categoryNameEn || 'Unknown',
          items_count: result.itemsCount,
          validation_status: result.validationStatus,
        }))
        .filter(result => result.semantic_score > 0)
        .sort((a, b) => b.semantic_score - a.semantic_score)
        .slice(0, limit);

      // 记录搜索历史
      if (user) {
        try {
          await db.insert(userSearchHistoryTable).values({
            userId: user.id,
            query,
            filters: JSON.stringify({}),
            resultsCount: scoredResults.length,
            searchType: 'semantic',
            ipAddress: ip,
          });
        } catch (error) {
          console.warn('Failed to save search history:', error);
        }
      }

      // 记录量表使用情况
      for (const result of scoredResults.slice(0, 5)) {
        try {
          await db.insert(scaleUsageTable).values({
            scaleId: result.id,
            userId: user?.id,
            actionType: 'search_result',
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || '',
          });
        } catch (error) {
          console.warn('Failed to save usage record:', error);
        }
      }

      return NextResponse.json({
        results: scoredResults,
        query,
        expandedTerms,
        searchType: 'semantic',
        totalResults: scoredResults.length,
      });

    } catch (error) {
      console.error('Semantic search API error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }, {
    identifier: 'semantic-search',
    limit: 20,
    windowInSeconds: 60,
  });
}