import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable } from '@/db/schema';
import { like, or, limit, sql } from 'drizzle-orm';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const suggestionRequestSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(10).default(5),
});

export async function GET(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('query') || '';
      const limitParam = parseInt(searchParams.get('limit') || '5');
      
      const { query: validatedQuery, limit: validatedLimit } = suggestionRequestSchema.parse({
        query,
        limit: limitParam,
      });

      if (validatedQuery.length < 1) {
        return NextResponse.json({ suggestions: [] });
      }

      const searchTerm = validatedQuery.toLowerCase();

      // 获取建议，优先显示缩写词匹配和常用量表
      const suggestions = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          nameEn: ecoaScaleTable.nameEn,
          acronym: ecoaScaleTable.acronym,
          usageCount: ecoaScaleTable.usageCount,
        })
        .from(ecoaScaleTable)
        .where(
          or(
            like(sql`LOWER(${ecoaScaleTable.acronym})`, `${searchTerm}%`),
            like(sql`LOWER(${ecoaScaleTable.name})`, `%${searchTerm}%`),
            like(sql`LOWER(${ecoaScaleTable.nameEn})`, `%${searchTerm}%`)
          )
        )
        .orderBy(
          // 缩写词完全匹配优先
          sql`CASE WHEN LOWER(${ecoaScaleTable.acronym}) = ${searchTerm} THEN 0 ELSE 1 END`,
          // 然后按使用频率排序
          sql`${ecoaScaleTable.usageCount} DESC`,
          // 最后按名称长度排序（短的优先）
          sql`LENGTH(${ecoaScaleTable.name})`
        )
        .limit(validatedLimit);

      const formattedSuggestions = suggestions.map(item => ({
        id: item.id,
        text: item.acronym ? `${item.name} (${item.acronym})` : item.name,
        acronym: item.acronym,
        name: item.name,
        nameEn: item.nameEn,
        usageCount: item.usageCount,
      }));

      return NextResponse.json({
        suggestions: formattedSuggestions,
        query: validatedQuery,
      });

    } catch (error) {
      console.error('Search suggestions API error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request parameters' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }, {
    identifier: 'search-suggestions',
    limit: 60,
    windowInSeconds: 60, // 1 minute
  });
}