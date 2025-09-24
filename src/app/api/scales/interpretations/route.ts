import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable, scaleInterpretationsTable } from '@/db/schema';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// 获取有解读指南的量表列表
export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();

    // 获取有解读指南的量表
    const scales = await db
      .selectDistinct({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        description: ecoaScaleTable.description,
        categoryName: ecoaCategoryTable.name,
        itemsCount: ecoaScaleTable.itemsCount,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        validationStatus: ecoaScaleTable.validationStatus,
        hasInterpretation: sql<boolean>`1`,
      })
      .from(ecoaScaleTable)
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
      .innerJoin(scaleInterpretationsTable, eq(ecoaScaleTable.id, scaleInterpretationsTable.scaleId))
      .where(eq(ecoaScaleTable.validationStatus, 'published'))
      .orderBy(ecoaScaleTable.usageCount, ecoaScaleTable.name);

    return NextResponse.json({
      success: true,
      scales
    });

  } catch (error) {
    console.error('获取解读指南量表列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scales with interpretations' },
      { status: 500 }
    );
  }
}