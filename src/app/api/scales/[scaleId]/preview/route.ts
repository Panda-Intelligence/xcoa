import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  ecoaScaleTable,
  ecoaCategoryTable,
  ecoaItemTable,
  scaleUsageTable
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { safeJSONParseArray, safeJSONParseObject } from '@/utils/json-parser';
import { z } from 'zod';

const previewParamsSchema = z.object({
  scaleId: z.string(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const db = getDB();
    const session = await getSessionFromCookie();
    const user = session?.user;
    const ip = await getIP(); // getIP是异步函数

    const params = await context.params;
    const { scaleId } = previewParamsSchema.parse(params);

    // 检查是否为完整模式（通过URL参数控制）
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'preview'; // preview 或 full
    const isFullMode = mode === 'full';

    // 获取量表基本信息
    const [scale] = await db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        description: ecoaScaleTable.description,
        descriptionEn: ecoaScaleTable.descriptionEn,
        categoryName: ecoaCategoryTable.name,
        itemsCount: ecoaScaleTable.itemsCount,
        dimensionsCount: ecoaScaleTable.dimensionsCount,
        languages: ecoaScaleTable.languages,
        validationStatus: ecoaScaleTable.validationStatus,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        ageRange: ecoaScaleTable.ageRange,
        domains: ecoaScaleTable.domains,
        scoringMethod: ecoaScaleTable.scoringMethod,
        copyrightInfo: ecoaScaleTable.copyrightInfo,
        psychometricProperties: ecoaScaleTable.psychometricProperties,
      })
      .from(ecoaScaleTable)
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
      .where(eq(ecoaScaleTable.id, scaleId));

    if (!scale) {
      return NextResponse.json(
        { error: 'Scale not found' },
        { status: 404 }
      );
    }

    // 根据模式获取题项数据
    const itemsQuery = db
      .select({
        id: ecoaItemTable.id,
        itemNumber: ecoaItemTable.itemNumber,
        question: ecoaItemTable.question,
        questionEn: ecoaItemTable.questionEn,
        dimension: ecoaItemTable.dimension,
        responseType: ecoaItemTable.responseType,
        responseOptions: ecoaItemTable.responseOptions,
        scoringInfo: ecoaItemTable.scoringInfo,
        isRequired: ecoaItemTable.isRequired,
      })
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, scaleId))
      .orderBy(ecoaItemTable.sortOrder, ecoaItemTable.itemNumber);

    // 如果是预览模式，只返回前5个题项
    const items = isFullMode ?
      await itemsQuery :
      await itemsQuery.limit(5);

    // 获取所有维度列表
    const allItems = await db
      .select({
        dimension: ecoaItemTable.dimension,
      })
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, scaleId));

    const dimensions = [...new Set(allItems.map(item => item.dimension).filter(Boolean))];

    // 记录预览访问
    try {
      await db.insert(scaleUsageTable).values({
        scaleId,
        userId: user?.id || null,
        actionType: isFullMode ? 'interactive_preview' : 'preview',
        ipAddress: typeof ip === 'string' ? ip : null,
        userAgent: request.headers.get('user-agent') || null,
        referrer: request.headers.get('referer') || null,
      });
    } catch (error) {
      console.warn('Failed to record preview:', error);
    }

    // 解析 JSON 字段（安全解析）
    const parsedScale = {
      ...scale,
      languages: safeJSONParseArray(scale.languages),
      domains: safeJSONParseArray(scale.domains),
      psychometricProperties: safeJSONParseObject(scale.psychometricProperties),
    };

    // 解析题项的 JSON 字段
    const parsedItems = items.map(item => ({
      ...item,
      responseOptions: safeJSONParseArray(item.responseOptions),
    }));

    // 生成预览样本数据（仅在预览模式）
    const sampleAnswers = !isFullMode ? parsedItems.map(item => {
      const options = item.responseOptions;
      if (options.length > 0) {
        // 随机选择一个中等程度的答案作为示例
        const middleIndex = Math.floor(options.length / 2);
        return {
          itemNumber: item.itemNumber,
          question: item.question,
          selectedOption: options[middleIndex],
          optionIndex: middleIndex,
        };
      }
      return null;
    }).filter(Boolean) : [];

    return NextResponse.json({
      scale: parsedScale,
      preview: {
        items: parsedItems,
        dimensions,
        totalItems: scale.itemsCount,
        previewCount: parsedItems.length,
        hasMoreItems: !isFullMode && parsedItems.length < (scale.itemsCount || 0),
        sampleAnswers,
        isFullMode,
      },
      previewInfo: {
        isPartialPreview: !isFullMode && parsedItems.length < (scale.itemsCount || 0),
        previewRatio: scale.itemsCount ? Math.round((parsedItems.length / scale.itemsCount) * 100) : 0,
        estimatedCompletionTime: scale.administrationTime,
        recommendedEnvironment: '安静的环境，避免干扰，确保不被打断',
        instructions: '请仔细阅读每个题项，根据您最近两周的感受选择最符合的选项。如有疑问，选择最接近的选项。',
        scoringInfo: parsedScale.scoringMethod,
      },
      scoring: parsedScale.psychometricProperties?.cutoffScores || null,
      viewedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Scale preview API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid scale ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate scale preview' },
      { status: 500 }
    );
  }
}