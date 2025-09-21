import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDB();
    
    // 获取平台统计数据
    const totalScales = await db
      .select({ count: sql`count(*)` })
      .from(ecoaScaleTable);
      
    const freeScales = await db
      .select({ count: sql`count(*)` })
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.isPublic, 1));
      
    // 获取前5个热门量表用于快速访问
    const topScales = await db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        acronym: ecoaScaleTable.acronym,
        usageCount: ecoaScaleTable.usageCount,
        validationStatus: ecoaScaleTable.validationStatus,
        isPublic: ecoaScaleTable.isPublic
      })
      .from(ecoaScaleTable)
      .orderBy(desc(ecoaScaleTable.usageCount))
      .limit(5);

    // 为每个量表添加许可图标
    const scalesWithIcons = topScales.map(scale => ({
      ...scale,
      license: getLicenseIcon(scale.validationStatus, scale.isPublic)
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalScales: totalScales[0]?.count || 0,
        freeScales: freeScales[0]?.count || 0,
        apiEndpoints: 8,
        avgResponseTime: '~450ms'
      },
      topScales: scalesWithIcons
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

// 根据验证状态和公开性返回许可图标
function getLicenseIcon(validationStatus: string, isPublic: number): string {
  if (isPublic === 1) {
    return '🆓'; // 免费使用
  }
  
  if (validationStatus === 'validated') {
    return '✅'; // 已验证，需要许可
  }
  
  return '📧'; // 需要联系版权方
}