import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  ecoaScaleTable,
  ecoaCategoryTable,
  userSearchHistoryTable,
  scaleUsageTable,
} from '@/db/schema';
import { and, or, like, desc, eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { checkRateLimit } from '@/utils/rate-limit';
import { z } from 'zod';

const searchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  category: z.string().optional(),
  sortBy: z.enum(['relevance', 'name', 'usage', 'recent']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  filters: z.object({
    validationStatus: z.string().optional(),
    languages: z.array(z.string()).optional(),
    itemsCountMin: z.number().optional(),
    itemsCountMax: z.number().optional(),
    administrationTimeMax: z.number().optional(),
  }).optional().default({})
});

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const session = await getSessionFromCookie();
    const user = session?.user;
    const ip = getIP(request);

    const body = await request.json();
    const { query, category, sortBy, page, limit, filters } = searchRequestSchema.parse(body);

    let actualLimit = limit;
    let searchesRemaining = -1;

    if (!user) {
      const rateLimitResult = await checkRateLimit({
        key: ip,
        options: {
          identifier: 'unauthenticated-search',
          limit: 3,
          windowInSeconds: 86400,
        },
      });

      if (!rateLimitResult.success) {
        const hoursRemaining = Math.ceil((rateLimitResult.reset - Date.now() / 1000) / 3600);
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded', 
            message: `You have reached your daily search limit. Please try again in ${hoursRemaining} hours or sign in for unlimited searches.`,
            searches_remaining: 0,
            reset: rateLimitResult.reset,
            requiresAuth: true,
          },
          { status: 429 }
        );
      }

      actualLimit = Math.min(limit, 5);
      searchesRemaining = rateLimitResult.remaining;
    }

      // 构建基础查询条件
      const baseConditions = [
        eq(ecoaScaleTable.isPublic, 1),
      ];

      // 添加搜索条件
      if (query.trim()) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        const searchConditions = searchTerms.map(term =>
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

        if (searchConditions.length > 0) {
          baseConditions.push(and(...searchConditions));
        }
      }

      // 添加分类筛选
      if (category && category !== 'all') {
        baseConditions.push(eq(ecoaScaleTable.categoryId, category));
      }

      // 添加高级筛选
      if (filters.validationStatus) {
        baseConditions.push(eq(ecoaScaleTable.validationStatus, filters.validationStatus));
      }

      if (filters.itemsCountMin !== undefined) {
        baseConditions.push(sql`${ecoaScaleTable.itemsCount} >= ${filters.itemsCountMin}`);
      }

      if (filters.itemsCountMax !== undefined) {
        baseConditions.push(sql`${ecoaScaleTable.itemsCount} <= ${filters.itemsCountMax}`);
      }

      if (filters.administrationTimeMax !== undefined) {
        baseConditions.push(sql`${ecoaScaleTable.administrationTime} <= ${filters.administrationTimeMax}`);
      }

      if (filters.languages && filters.languages.length > 0) {
        const languageConditions = filters.languages.map(lang =>
          like(ecoaScaleTable.languages, `%"${lang}"%`)
        );
        baseConditions.push(or(...languageConditions));
      }

      // 构建排序条件
      let orderBy;
      switch (sortBy) {
        case 'name':
          orderBy = [ecoaScaleTable.name];
          break;
        case 'usage':
          orderBy = [desc(ecoaScaleTable.usageCount)];
          break;
        case 'recent':
          orderBy = [desc(ecoaScaleTable.createdAt)];
          break;
        case 'relevance':
        default:
          // 对于相关性排序，我们可以基于匹配字段的权重
          orderBy = [desc(ecoaScaleTable.usageCount), ecoaScaleTable.name];
          break;
      }

      // 计算偏移量
      const offset = (page - 1) * limit;

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
        .where(and(...baseConditions))
        .orderBy(...orderBy)
        .limit(actualLimit)
        .offset(offset);

      // 获取总数用于分页
      const [{ count }] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(and(...baseConditions));

      // 计算匹配分数（简单的文本匹配算法）
      const processedResults = results.map(result => {
        let matchScore = 0;
        const searchLower = query.toLowerCase();

        // 精确匹配缩写词获得最高分
        if (result.acronym?.toLowerCase() === searchLower) {
          matchScore = 100;
        }
        // 名称完全匹配
        else if (result.name?.toLowerCase() === searchLower || result.nameEn?.toLowerCase() === searchLower) {
          matchScore = 95;
        }
        // 名称部分匹配
        else if (result.name?.toLowerCase().includes(searchLower) || result.nameEn?.toLowerCase().includes(searchLower)) {
          matchScore = 80;
        }
        // 描述匹配
        else if (result.description?.toLowerCase().includes(searchLower) || result.descriptionEn?.toLowerCase().includes(searchLower)) {
          matchScore = 60;
        }
        // 其他字段匹配
        else {
          matchScore = 40;
        }

        // 基于使用频率调整分数
        matchScore += Math.min(result.usageCount * 0.1, 20);

        return {
          ...result,
          match_score: Math.round(matchScore),
          // 格式化输出以兼容现有前端
          category: result.categoryName || result.categoryNameEn || 'Unknown',
          items_count: result.itemsCount,
          validation_status: result.validationStatus,
        };
      });

      // 记录搜索历史
      if (user) {
        try {
          await db.insert(userSearchHistoryTable).values({
            userId: user.id,
            query,
            filters: JSON.stringify(filters),
            resultsCount: processedResults.length,
            searchType: 'general',
            ipAddress: ip,
          });
        } catch (error) {
          console.warn('Failed to save search history:', error);
        }
      }

      // 记录量表使用情况
      for (const result of processedResults.slice(0, 10)) { // 只记录前10个结果
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

      // 更新用户剩余搜索次数（如果适用）
      if (!user) {
        return NextResponse.json({
          results: processedResults,
          pagination: {
            page,
            limit: actualLimit,
            total: count,
            totalPages: Math.ceil(count / actualLimit),
          },
          query,
          filters,
          searches_remaining: searchesRemaining,
          is_authenticated: false,
          message: searchesRemaining > 0 
            ? `You have ${searchesRemaining} searches remaining today. Sign in for unlimited searches and full access.`
            : 'This is your last search for today. Sign in for unlimited searches.',
        });
      }

      return NextResponse.json({
        results: processedResults,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
        query,
        filters,
        searches_remaining: -1,
        is_authenticated: true,
      });

    } catch (error) {
      console.error('Search API error:', error);

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
}