import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();

    // 查询前10个热门量表（按使用次数排序）
    const hotScales = await db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        categoryId: ecoaScaleTable.categoryId,
        categoryName: ecoaCategoryTable.name,
        itemsCount: ecoaScaleTable.itemsCount,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        validationStatus: ecoaScaleTable.validationStatus,
        usageCount: ecoaScaleTable.usageCount,
        favoriteCount: ecoaScaleTable.favoriteCount,
        licenseType: ecoaScaleTable.licenseType
      })
      .from(ecoaScaleTable)
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
      .orderBy(desc(ecoaScaleTable.usageCount), desc(ecoaScaleTable.favoriteCount))
      .limit(10);

    // 为每个量表添加图标
    const scalesWithIcons = hotScales.map(scale => ({
      ...scale,
      icon: getScaleIcon(scale.categoryName, scale.validationStatus)
    }));

    return NextResponse.json({
      success: true,
      scales: scalesWithIcons,
      total: hotScales.length
    });

  } catch (error) {
    console.error('Get hot scales error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hot scales' },
      { status: 500 }
    );
  }
}

// 根据分类和验证状态返回合适的图标
function getScaleIcon(categoryName: string | null, validationStatus: string): string {
  // 根据验证状态
  if (validationStatus === 'validated') {
    return '✅';
  }

  // 根据分类
  if (categoryName?.includes('抑郁')) {
    return '😔';
  } else if (categoryName?.includes('焦虑')) {
    return '😰';
  } else if (categoryName?.includes('认知')) {
    return '🧠';
  } else if (categoryName?.includes('生活质量')) {
    return '❤️';
  } else if (categoryName?.includes('疼痛')) {
    return '🩹';
  }

  return '📋'; // 默认图标
}