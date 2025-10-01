import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, desc, asc, sql, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category') || 'all';
    const treatmentArea = searchParams.get('treatmentArea') || 'all';
    const sortBy = searchParams.get('sortBy') || 'relevance';

    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        categoryId: ecoaScaleTable.categoryId,
        categoryName: ecoaCategoryTable.name,
        treatmentArea: ecoaScaleTable.treatmentArea,
        itemsCount: ecoaScaleTable.itemsCount,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        validationStatus: ecoaScaleTable.validationStatus,
        usageCount: ecoaScaleTable.usageCount,
        favoriteCount: ecoaScaleTable.favoriteCount,
        licenseType: ecoaScaleTable.licenseType
      })
      .from(ecoaScaleTable)
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id));

    const whereConditions = [];
    
    if (category !== 'all') {
      whereConditions.push(eq(ecoaScaleTable.categoryId, category));
    }
    
    if (treatmentArea !== 'all') {
      whereConditions.push(eq(ecoaScaleTable.treatmentArea, treatmentArea));
    }
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    switch (sortBy) {
      case 'name':
        query = query.orderBy(asc(ecoaScaleTable.name));
        break;
      case 'usage':
        query = query.orderBy(desc(ecoaScaleTable.usageCount), desc(ecoaScaleTable.favoriteCount));
        break;
      case 'recent':
        query = query.orderBy(desc(ecoaScaleTable.createdAt));
        break;
      case 'relevance':
      default:
        query = query.orderBy(desc(ecoaScaleTable.usageCount), desc(ecoaScaleTable.favoriteCount));
        break;
    }

    const scales = await query.limit(limit).offset(offset);

    let countQuery = db.select({ count: sql`count(*)` }).from(ecoaScaleTable);
    
    if (whereConditions.length > 0) {
      countQuery = countQuery.where(and(...whereConditions));
    }

    const totalResult = await countQuery;
    const total = Number(totalResult[0]?.count) || 0;

    const scalesWithIcons = scales.map(scale => ({
      ...scale,
      icon: getScaleIcon(scale.categoryName, scale.validationStatus)
    }));

    return NextResponse.json({
      success: true,
      scales: scalesWithIcons,
      total,
      page,
      limit
    });

  } catch (error) {
    console.error('Get scales error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scales' },
      { status: 500 }
    );
  }
}

function getScaleIcon(categoryName: string | null, validationStatus: string): string {
  if (validationStatus === 'validated') {
    return '✅';
  }

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

  return '📋';
}
