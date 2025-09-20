import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB } from '@/db';
import { ecoaScaleTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const generateEmbeddingSchema = z.object({
  text: z.string().min(1).max(2000),
  scaleId: z.string().optional(),
});

// 计算向量相似度 (余弦相似度)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// 使用 Workers AI 生成文本嵌入
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { env } = getCloudflareContext();
    
    if (!env.AI) {
      throw new Error('Workers AI not available');
    }

    // 使用 BGE 模型生成嵌入向量
    const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [text]
    });

    if (!response.data || !response.data[0]) {
      throw new Error('No embedding generated');
    }

    return response.data[0];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// 生成单个文本的嵌入向量
export async function POST(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const body = await request.json();
      const { text, scaleId } = generateEmbeddingSchema.parse(body);
      
      // 生成嵌入向量
      const embedding = await generateEmbedding(text);
      
      // 如果提供了 scaleId，则更新数据库中的向量
      if (scaleId) {
        const db = getDB();
        await db
          .update(ecoaScaleTable)
          .set({ 
            searchVector: JSON.stringify(embedding)
          })
          .where(eq(ecoaScaleTable.id, scaleId));
      }
      
      return NextResponse.json({
        embedding,
        dimensions: embedding.length,
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        scaleId,
        updated: !!scaleId
      });

    } catch (error) {
      console.error('Generate embedding API error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate embedding', details: error.message },
        { status: 500 }
      );
    }
  }, {
    identifier: 'generate-embedding',
    limit: 100,
    windowInSeconds: 60,
  });
}

// 批量更新所有量表的嵌入向量
export async function PUT(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      
      // 获取所有需要更新向量的量表
      const scales = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          nameEn: ecoaScaleTable.nameEn,
          description: ecoaScaleTable.description,
          descriptionEn: ecoaScaleTable.descriptionEn,
          searchVector: ecoaScaleTable.searchVector,
        })
        .from(ecoaScaleTable)
        .where(eq(ecoaScaleTable.isPublic, 1));

      const updatedScales = [];
      const errors = [];

      for (const scale of scales) {
        try {
          // 构建用于嵌入的文本（中英文描述组合）
          const embeddingText = [
            scale.name,
            scale.nameEn,
            scale.description?.substring(0, 500), // 限制长度
            scale.descriptionEn?.substring(0, 500)
          ].filter(Boolean).join(' ');

          // 生成嵌入向量
          const embedding = await generateEmbedding(embeddingText);
          
          // 更新数据库
          await db
            .update(ecoaScaleTable)
            .set({ 
              searchVector: JSON.stringify(embedding)
            })
            .where(eq(ecoaScaleTable.id, scale.id));

          updatedScales.push({
            id: scale.id,
            name: scale.name,
            dimensions: embedding.length,
            textLength: embeddingText.length
          });

          // 添加延迟避免 API 限制
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`Error updating scale ${scale.id}:`, error);
          errors.push({
            id: scale.id,
            name: scale.name,
            error: error.message
          });
        }
      }
      
      return NextResponse.json({
        message: 'Batch embedding update completed',
        totalScales: scales.length,
        updatedCount: updatedScales.length,
        errorCount: errors.length,
        updatedScales,
        errors
      });

    } catch (error) {
      console.error('Batch embedding update error:', error);
      return NextResponse.json(
        { error: 'Failed to update embeddings', details: error.message },
        { status: 500 }
      );
    }
  }, {
    identifier: 'batch-embedding-update',
    limit: 5,
    windowInSeconds: 3600, // 每小时最多5次批量更新
  });
}