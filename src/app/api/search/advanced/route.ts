import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  ecoaScaleTable,
  ecoaCategoryTable,
  userSearchHistoryTable,
  scaleUsageTable
} from '@/db/schema';
import { and, or, like, desc, eq, sql, gte, lte, inArray } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const advancedSearchRequestSchema = z.object({
  // 基础查询
  query: z.string().optional(),

  // 分类筛选
  categories: z.array(z.string()).optional(),

  // 验证状态筛选
  validationStatuses: z.array(z.string()).optional(),

  // 语言筛选
  languages: z.array(z.string()).optional(),

  // 数值范围筛选
  itemsCount: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),

  administrationTime: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),

  // 领域筛选
  domains: z.array(z.string()).optional(),

  // 目标人群筛选
  targetPopulations: z.array(z.string()).optional(),

  // 年龄范围筛选
  ageRanges: z.array(z.string()).optional(),

  // 排序和分页
  sortBy: z.enum([
    'relevance', 'name', 'usage', 'recent', 'items_count',
    'administration_time', 'validation_status'
  ]).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),

  // 搜索选项
  includePartialMatches: z.boolean().default(true),
  caseSensitive: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;
      const ip = getIP(request);

      const body = await request.json();
      const searchParams = advancedSearchRequestSchema.parse(body);

      const {
        query,
        categories,
        validationStatuses,
        languages,
        itemsCount,
        administrationTime,
        domains,
        targetPopulations,
        ageRanges,
        sortBy,
        sortOrder,
        page,
        limit,
        includePartialMatches,
        caseSensitive
      } = searchParams;

      // 构建查询条件
      const conditions = [eq(ecoaScaleTable.isPublic, 1)];

      // 文本搜索条件
      if (query && query.trim()) {
        const searchTerm = caseSensitive ? query.trim() : query.trim().toLowerCase();
        const sqlFunction = caseSensitive ? sql : (field: any) => sql`LOWER(${field})`;

        const textConditions = [
          like(sqlFunction(ecoaScaleTable.name), includePartialMatches ? `%${searchTerm}%` : searchTerm),
          like(sqlFunction(ecoaScaleTable.nameEn), includePartialMatches ? `%${searchTerm}%` : searchTerm),
          like(sqlFunction(ecoaScaleTable.acronym), includePartialMatches ? `%${searchTerm}%` : searchTerm),
          like(sqlFunction(ecoaScaleTable.description), `%${searchTerm}%`),
          like(sqlFunction(ecoaScaleTable.descriptionEn), `%${searchTerm}%`),
          like(sqlFunction(ecoaScaleTable.targetPopulation), `%${searchTerm}%`),
        ];

        conditions.push(or(...textConditions));
      }

      // 分类筛选
      if (categories && categories.length > 0) {
        conditions.push(inArray(ecoaScaleTable.categoryId, categories));
      }

      // 验证状态筛选
      if (validationStatuses && validationStatuses.length > 0) {
        conditions.push(inArray(ecoaScaleTable.validationStatus, validationStatuses));
      }

      // 语言筛选
      if (languages && languages.length > 0) {
        const languageConditions = languages.map(lang =>
          like(ecoaScaleTable.languages, `%"${lang}"%`)
        );
        conditions.push(or(...languageConditions));
      }

      // 题项数量范围筛选
      if (itemsCount?.min !== undefined) {
        conditions.push(gte(ecoaScaleTable.itemsCount, itemsCount.min));
      }
      if (itemsCount?.max !== undefined) {
        conditions.push(lte(ecoaScaleTable.itemsCount, itemsCount.max));
      }

      // 管理时间范围筛选
      if (administrationTime?.min !== undefined) {
        conditions.push(gte(ecoaScaleTable.administrationTime, administrationTime.min));
      }
      if (administrationTime?.max !== undefined) {
        conditions.push(lte(ecoaScaleTable.administrationTime, administrationTime.max));
      }

      // 领域筛选
      if (domains && domains.length > 0) {
        const domainConditions = domains.map(domain =>
          like(ecoaScaleTable.domains, `%"${domain}"%`)
        );
        conditions.push(or(...domainConditions));
      }

      // 目标人群筛选
      if (targetPopulations && targetPopulations.length > 0) {
        const targetConditions = targetPopulations.map(target =>
          like(ecoaScaleTable.targetPopulation, `%${target}%`)
        );
        conditions.push(or(...targetConditions));
      }

      // 年龄范围筛选
      if (ageRanges && ageRanges.length > 0) {
        const ageConditions = ageRanges.map(age =>
          like(ecoaScaleTable.ageRange, `%${age}%`)
        );
        conditions.push(or(...ageConditions));
      }

      // 构建排序条件
      const getSortColumn = () => {
        switch (sortBy) {
          case 'name':
            return ecoaScaleTable.name;
          case 'usage':
            return ecoaScaleTable.usageCount;
          case 'recent':
            return ecoaScaleTable.createdAt;
          case 'items_count':
            return ecoaScaleTable.itemsCount;
          case 'administration_time':
            return ecoaScaleTable.administrationTime;
          case 'validation_status':
            return ecoaScaleTable.validationStatus;
          case 'relevance':
          default:
            return ecoaScaleTable.usageCount;
        }
      };

      const orderByClause = sortOrder === 'asc' ?
        getSortColumn() :
        desc(getSortColumn());

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
          createdAt: ecoaScaleTable.createdAt,
        })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(and(...conditions))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      // 获取总数
      const [{ count: totalCount }] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(and(...conditions));

      // 格式化结果
      const formattedResults = results.map(result => ({
        ...result,
        category: result.categoryName || result.categoryNameEn || 'Unknown',
        items_count: result.itemsCount,
        validation_status: result.validationStatus,
        languages_parsed: Array.isArray(result.languages) ? result.languages :
          (result.languages ? JSON.parse(result.languages) : []),
        domains_parsed: Array.isArray(result.domains) ? result.domains :
          (result.domains ? JSON.parse(result.domains) : []),
      }));

      // 记录搜索历史
      if (user) {
        try {
          await db.insert(userSearchHistoryTable).values({
            userId: user.id,
            query: query || '[Advanced Filter]',
            filters: JSON.stringify(searchParams),
            resultsCount: formattedResults.length,
            searchType: 'advanced',
            ipAddress: ip,
          });
        } catch (error) {
          console.warn('Failed to save search history:', error);
        }
      }

      // 记录使用分析
      for (const result of formattedResults.slice(0, 10)) {
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
        results: formattedResults,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        searchParams: {
          ...searchParams,
          appliedFilters: {
            hasQuery: !!query,
            categoriesCount: categories?.length || 0,
            validationStatusesCount: validationStatuses?.length || 0,
            languagesCount: languages?.length || 0,
            hasItemsCountFilter: !!(itemsCount?.min || itemsCount?.max),
            hasTimeFilter: !!(administrationTime?.min || administrationTime?.max),
            domainsCount: domains?.length || 0,
            targetPopulationsCount: targetPopulations?.length || 0,
            ageRangesCount: ageRanges?.length || 0,
          }
        },
        searchType: 'advanced',
        statistics: {
          totalMatches: totalCount,
          averageItemsCount: Math.round(
            formattedResults.reduce((sum, r) => sum + (r.itemsCount || 0), 0) / formattedResults.length || 0
          ),
          averageAdministrationTime: Math.round(
            formattedResults.reduce((sum, r) => sum + (r.administrationTime || 0), 0) /
            formattedResults.filter(r => r.administrationTime).length || 0
          ),
          validationStatusDistribution: formattedResults.reduce((acc, r) => {
            acc[r.validationStatus] = (acc[r.validationStatus] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        }
      });

    } catch (error) {
      console.error('Advanced search API error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid search parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Advanced search failed', details: error.message },
        { status: 500 }
      );
    }
  }, {
    identifier: 'advanced-search',
    limit: 100,
    windowInSeconds: 60,
  });
}