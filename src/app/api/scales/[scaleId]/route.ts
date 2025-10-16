import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  ecoaScaleTable,
  ecoaCategoryTable,
  ecoaItemTable,
  userFavoriteTable,
  scaleUsageTable,
} from '@/db/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { z } from 'zod';
// TODO: Re-enable once subscription schema is created
// import { checkFeatureAccess, incrementUsage } from '@/services/subscription';

const scaleDetailParamsSchema = z.object({
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
    const ip = getIP(request);

    const params = await context.params;
    const { scaleId } = scaleDetailParamsSchema.parse(params);

    // 检查查看权限（如果URL包含checkAccess参数）
    const { searchParams } = new URL(request.url);
    const shouldCheckAccess = searchParams.get('checkAccess') === 'true';

    // TODO: Re-enable once subscription schema is created
    // if (shouldCheckAccess && session) {
    //   const accessResult = await checkFeatureAccess(session.userId, 'scale_view');
    //
    //   if (!accessResult.allowed) {
    //     return NextResponse.json(
    //       {
    //         error: 'Access denied',
    //         reason: accessResult.reason,
    //         requiresUpgrade: accessResult.requiresUpgrade
    //       },
    //       { status: 403 }
    //     );
    //   }
    //
    //   // 记录使用量
    //   await incrementUsage(session.userId, 'scale_view');
    // }

    // 获取量表详细信息
    const [scale] = await db
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
        categoryDescription: ecoaCategoryTable.description,
        itemsCount: ecoaScaleTable.itemsCount,
        dimensionsCount: ecoaScaleTable.dimensionsCount,
        languages: ecoaScaleTable.languages,
        validationStatus: ecoaScaleTable.validationStatus,
        copyrightInfo: ecoaScaleTable.copyrightInfo,
        scoringMethod: ecoaScaleTable.scoringMethod,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        ageRange: ecoaScaleTable.ageRange,
        domains: ecoaScaleTable.domains,
        psychometricProperties: ecoaScaleTable.psychometricProperties,
        references: ecoaScaleTable.references,
        downloadUrl: ecoaScaleTable.downloadUrl,
        usageCount: ecoaScaleTable.usageCount,
        favoriteCount: ecoaScaleTable.favoriteCount,
        createdAt: ecoaScaleTable.createdAt,
        updatedAt: ecoaScaleTable.updatedAt,
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

    // 获取量表题项（如果有的话）
    const items = await db
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
        sortOrder: ecoaItemTable.sortOrder,
      })
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, scaleId))
      .orderBy(ecoaItemTable.sortOrder, ecoaItemTable.itemNumber);

    // 检查用户是否收藏了这个量表
    let isFavorited = false;
    if (user) {
      const [favorite] = await db
        .select({ id: userFavoriteTable.id })
        .from(userFavoriteTable)
        .where(
          and(
            eq(userFavoriteTable.userId, user.id),
            eq(userFavoriteTable.scaleId, scaleId)
          )
        );
      isFavorited = !!favorite;
    }

    // 获取相关量表推荐（同分类的其他量表）
    const relatedScales = await db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        description: ecoaScaleTable.description,
        itemsCount: ecoaScaleTable.itemsCount,
        administrationTime: ecoaScaleTable.administrationTime,
        usageCount: ecoaScaleTable.usageCount,
        validationStatus: ecoaScaleTable.validationStatus,
      })
      .from(ecoaScaleTable)
      .where(
        eq(ecoaScaleTable.categoryId, scale.categoryId!) &&
        sql`${ecoaScaleTable.id} != ${scaleId}` &&
        eq(ecoaScaleTable.isPublic, 1)
      )
      .orderBy(desc(ecoaScaleTable.usageCount))
      .limit(5);

    // 获取使用统计（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [usageStats] = await db
      .select({
        totalViews: count(scaleUsageTable.id),
        recentViews: count(
          sql`CASE WHEN ${scaleUsageTable.createdAt} >= ${Math.floor(thirtyDaysAgo.getTime() / 1000)} THEN 1 END`
        ),
      })
      .from(scaleUsageTable)
      .where(eq(scaleUsageTable.scaleId, scaleId));

    // 记录此次查看
    try {
      await db.insert(scaleUsageTable).values({
        scaleId,
        userId: user?.id,
        actionType: 'view',
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || '',
      });

      // 更新量表的使用计数
      await db
        .update(ecoaScaleTable)
        .set({
          usageCount: sql`${ecoaScaleTable.usageCount} + 1`
        })
        .where(eq(ecoaScaleTable.id, scaleId));
    } catch (error) {
      console.warn('Failed to record scale view:', error);
    }

    // 解析 JSON 字段 (Drizzle 已经自动解析了)
    const parsedScale = {
      ...scale,
      languages: Array.isArray(scale.languages) ? scale.languages :
        (scale.languages ? JSON.parse(scale.languages) : []),
      domains: Array.isArray(scale.domains) ? scale.domains :
        (scale.domains ? JSON.parse(scale.domains) : []),
      psychometricProperties: typeof scale.psychometricProperties === 'object' ?
        scale.psychometricProperties :
        (scale.psychometricProperties ? JSON.parse(scale.psychometricProperties) : null),
      references: Array.isArray(scale.references) ? scale.references :
        (scale.references ? JSON.parse(scale.references) : []),
    };

    // 解析题项的 JSON 字段
    const parsedItems = items.map(item => ({
      ...item,
      responseOptions: Array.isArray(item.responseOptions) ? item.responseOptions :
        (item.responseOptions ? JSON.parse(item.responseOptions) : []),
    }));

    // 检查用户是否有权查看完整题目
    let itemsToReturn = parsedItems;
    // TODO: Re-enable once subscription schema is created
    // if (session) {
    //   const limits = await checkFeatureAccess(session.userId, 'scale_view');
    //   // 如果是免费用户，只显示前3个题目作为预览
    //   if (session && parsedItems.length > 3) {
    //     const userPlan = await checkFeatureAccess(session.userId, 'scale_view');
    //     if (!userPlan.allowed && parsedItems.length > 3) {
    //       itemsToReturn = parsedItems.slice(0, 3);
    //     }
    //   }
    // } else if (parsedItems.length > 3) {
    if (parsedItems.length > 3 && !session) {
      // 未登录用户只能看前3个题目
      itemsToReturn = parsedItems.slice(0, 3);
    }

    return NextResponse.json({
      scale: parsedScale,
      items: itemsToReturn,
      userInteraction: {
        isFavorited,
        canDownload: user ? true : false, // 基于登录状态调整
        hasFullAccess: itemsToReturn.length === parsedItems.length,
        totalItems: parsedItems.length,
      },
      relatedScales,
      statistics: {
        totalViews: usageStats?.totalViews || 0,
        recentViews: usageStats?.recentViews || 0,
        totalFavorites: scale.favoriteCount || 0,
      },
      meta: {
        hasItems: parsedItems.length > 0,
        itemsCount: parsedItems.length,
        lastUpdated: scale.updatedAt,
        viewedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Scale detail API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid scale ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch scale details' },
      { status: 500 }
    );
  }
}