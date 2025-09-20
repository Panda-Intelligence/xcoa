import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB } from '@/db';
import { 
  ecoaScaleTable, 
  ecoaCategoryTable, 
  userSearchHistoryTable, 
  scaleUsageTable
} from '@/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const vectorSearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.3), // 相似度阈值
});

// 计算向量相似度 (余弦相似度)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// 使用 Workers AI 生成查询嵌入
async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    // 在开发环境中，跳过 Workers AI 调用
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Workers AI not available in development');
    }

    const { env } = getCloudflareContext();
    
    if (!env.AI) {
      throw new Error('Workers AI not available');
    }

    const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [query]
    });

    if (!response.data || !response.data[0]) {
      throw new Error('No embedding generated for query');
    }

    return response.data[0];
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;
      const ip = getIP(request);
      
      const body = await request.json();
      const { query, limit, threshold } = vectorSearchRequestSchema.parse(body);
      
      // 生成查询的嵌入向量
      const queryEmbedding = await generateQueryEmbedding(query);
      
      // 获取所有有向量的量表
      const scales = await db
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
          searchVector: ecoaScaleTable.searchVector,
        })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(
          and(
            eq(ecoaScaleTable.isPublic, 1),
            isNotNull(ecoaScaleTable.searchVector)
          )
        );

      // 计算相似度并排序
      const scoredResults = scales
        .map(scale => {
          try {
            const scaleVector = JSON.parse(scale.searchVector || '[]');
            const similarity = cosineSimilarity(queryEmbedding, scaleVector);
            
            return {
              ...scale,
              vector_similarity: similarity,
              match_score: Math.round(similarity * 100),
              category: scale.categoryName || scale.categoryNameEn || 'Unknown',
              items_count: scale.itemsCount,
              validation_status: scale.validationStatus,
            };
          } catch (error) {
            console.warn(`Error parsing vector for scale ${scale.id}:`, error);
            return null;
          }
        })
        .filter(result => result !== null && result.vector_similarity >= threshold)
        .sort((a, b) => b.vector_similarity - a.vector_similarity)
        .slice(0, limit);

      // 记录搜索历史
      if (user) {
        try {
          await db.insert(userSearchHistoryTable).values({
            userId: user.id,
            query,
            filters: JSON.stringify({ threshold }),
            resultsCount: scoredResults.length,
            searchType: 'vector',
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
        searchType: 'vector',
        queryEmbedding: {
          dimensions: queryEmbedding.length,
          sample: queryEmbedding.slice(0, 5) // 只返回前5个数值作为示例
        },
        threshold,
        totalResults: scoredResults.length,
        availableScales: scales.length,
      });

    } catch (error) {
      console.error('Vector search API error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request parameters', details: error.errors },
          { status: 400 }
        );
      }

      // 如果 Workers AI 不可用，返回友好的错误信息
      if (error.message.includes('Workers AI not available')) {
        return NextResponse.json(
          { 
            error: 'Vector search temporarily unavailable', 
            message: 'Please try the semantic search instead',
            fallbackEndpoint: '/api/search/semantic'
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Vector search failed', details: error.message },
        { status: 500 }
      );
    }
  }, {
    identifier: 'vector-search',
    limit: 50,
    windowInSeconds: 60,
  });
}