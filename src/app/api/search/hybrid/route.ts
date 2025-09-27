import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  ecoaScaleTable,
  ecoaCategoryTable,
  userSearchHistoryTable,
  scaleUsageTable
} from '@/db/schema';
import { and, or, like, eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const hybridSearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  category: z.string().optional(),
  sortBy: z.enum(['relevance', 'name', 'usage', 'recent']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  includeSemanticExpansion: z.boolean().default(true),
  semanticWeight: z.number().min(0).max(1).default(0.7), // 语义搜索权重
  keywordWeight: z.number().min(0).max(1).default(0.3),  // 关键词搜索权重
});

// 语义搜索的关键词映射
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

// 扩展查询词汇
function expandQuery(query: string): string[] {
  const expandedTerms = [query.toLowerCase()];

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

  return [...new Set(expandedTerms)];
}

// 计算关键词匹配分数
function calculateKeywordScore(scale: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  // 精确匹配缩写获得最高分
  if (scale.acronym?.toLowerCase() === queryLower) {
    score = 100;
  }
  // 名称完全匹配
  else if (scale.name?.toLowerCase() === queryLower || scale.nameEn?.toLowerCase() === queryLower) {
    score = 95;
  }
  // 名称部分匹配
  else if (scale.name?.toLowerCase().includes(queryLower) || scale.nameEn?.toLowerCase().includes(queryLower)) {
    score = 80;
  }
  // 描述匹配
  else if (scale.description?.toLowerCase().includes(queryLower) || scale.descriptionEn?.toLowerCase().includes(queryLower)) {
    score = 60;
  }
  // 其他字段匹配
  else {
    score = 40;
  }

  return score;
}

// 计算语义匹配分数
function calculateSemanticScore(scale: any, expandedTerms: string[]): number {
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

  expandedTerms.forEach(term => {
    const termLower = term.toLowerCase();

    // 精确匹配缩写
    if (scale.acronym && scale.acronym.toLowerCase() === termLower) {
      score += 50;
    }
    // 标题匹配
    else if (scale.name && scale.name.toLowerCase().includes(termLower)) {
      score += 30;
    }
    // 英文标题匹配
    else if (scale.nameEn && scale.nameEn.toLowerCase().includes(termLower)) {
      score += 25;
    }
    // 描述匹配
    else if (content.includes(termLower)) {
      score += 15;
    }
  });

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
      const {
        query,
        category,
        sortBy,
        page,
        limit,
        includeSemanticExpansion,
        semanticWeight,
        keywordWeight
      } = hybridSearchRequestSchema.parse(body);

      // 构建基础查询条件
      const baseConditions = [eq(ecoaScaleTable.isPublic, 1)];

      // 扩展查询词汇（如果启用语义扩展）
      const expandedTerms = includeSemanticExpansion ? expandQuery(query) : [query];
      
      // 限制扩展词汇数量，避免查询过于复杂
      const limitedTerms = expandedTerms.slice(0, 5);

      // 构建搜索条件 - 简化查询以避免复杂度问题
      const primaryTerm = query.toLowerCase();
      const searchCondition = or(
        like(sql`LOWER(${ecoaScaleTable.name})`, `%${primaryTerm}%`),
        like(sql`LOWER(${ecoaScaleTable.nameEn})`, `%${primaryTerm}%`),
        like(sql`LOWER(${ecoaScaleTable.acronym})`, `%${primaryTerm}%`),
        like(sql`LOWER(${ecoaScaleTable.description})`, `%${primaryTerm}%`)
      );

      baseConditions.push(searchCondition);

      // 添加分类筛选
      if (category && category !== 'all') {
        baseConditions.push(eq(ecoaScaleTable.categoryId, category));
      }

      // 执行搜索查询
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
        .where(and(...baseConditions));

      // 计算混合评分 - 使用限制后的词汇
      const scoredResults = results.map(result => {
        const keywordScore = calculateKeywordScore(result, query);
        const semanticScore = calculateSemanticScore(result, limitedTerms);

        // 混合评分：加权平均
        const hybridScore = (keywordScore * keywordWeight) + (semanticScore * semanticWeight);

        // 基于使用频率和验证状态的加权
        let finalScore = hybridScore;
        finalScore += Math.min((result.usageCount || 0) * 0.1, 10);
        if (result.validationStatus === 'validated') {
          finalScore += 5;
        }

        return {
          ...result,
          keyword_score: Math.round(keywordScore),
          semantic_score: Math.round(semanticScore),
          hybrid_score: Math.round(hybridScore),
          final_score: Math.round(finalScore),
          match_score: Math.round(finalScore),
          category: result.categoryName || result.categoryNameEn || 'Unknown',
          items_count: result.itemsCount,
          validation_status: result.validationStatus,
        };
      });

      // 排序
      let sortedResults = scoredResults;
      switch (sortBy) {
        case 'name':
          sortedResults = scoredResults.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'usage':
          sortedResults = scoredResults.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
          break;
        case 'recent':
          sortedResults = scoredResults.sort((a, b) => b.final_score - a.final_score);
          break;
        case 'relevance':
        default:
          sortedResults = scoredResults.sort((a, b) => b.final_score - a.final_score);
          break;
      }

      // 分页
      const offset = (page - 1) * limit;
      const paginatedResults = sortedResults.slice(offset, offset + limit);

      // 记录搜索历史
      if (user) {
        try {
          await db.insert(userSearchHistoryTable).values({
            userId: user.id,
            query,
            filters: JSON.stringify({
              category,
              includeSemanticExpansion,
              semanticWeight,
              keywordWeight
            }),
            resultsCount: paginatedResults.length,
            searchType: 'hybrid',
            ipAddress: ip,
          });
        } catch (error) {
          console.warn('Failed to save search history:', error);
        }
      }

      // 记录量表使用情况
      for (const result of paginatedResults.slice(0, 10)) {
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
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total: scoredResults.length,
          totalPages: Math.ceil(scoredResults.length / limit),
        },
        searchConfig: {
          query,
          expandedTerms: includeSemanticExpansion ? limitedTerms : [query],
          semanticWeight,
          keywordWeight,
          includeSemanticExpansion,
        },
        searchType: 'hybrid',
        statistics: {
          avgKeywordScore: Math.round(
            paginatedResults.reduce((sum, r) => sum + r.keyword_score, 0) / paginatedResults.length || 0
          ),
          avgSemanticScore: Math.round(
            paginatedResults.reduce((sum, r) => sum + r.semantic_score, 0) / paginatedResults.length || 0
          ),
          avgHybridScore: Math.round(
            paginatedResults.reduce((sum, r) => sum + r.hybrid_score, 0) / paginatedResults.length || 0
          ),
        }
      });

    } catch (error) {
      console.error('Hybrid search API error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Hybrid search failed', details: error.message },
        { status: 500 }
      );
    }
  }, {
    identifier: 'hybrid-search',
    limit: 60,
    windowInSeconds: 60,
  });
}