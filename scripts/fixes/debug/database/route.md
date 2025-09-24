import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaItemTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDB();

    // 检查所有量表的题目数据
    const scalesWithItems = await db
      .select({
        scaleId: ecoaScaleTable.id,
        scaleName: ecoaScaleTable.name,
        acronym: ecoaScaleTable.acronym,
        expectedItems: ecoaScaleTable.itemsCount,
        actualItems: sql`COUNT(${ecoaItemTable.id})`,
      })
      .from(ecoaScaleTable)
      .leftJoin(ecoaItemTable, eq(ecoaScaleTable.id, ecoaItemTable.scaleId))
      .groupBy(ecoaScaleTable.id);

    // 检查PHQ-9的详细题目
    const phq9Items = await db
      .select({
        itemNumber: ecoaItemTable.itemNumber,
        question: ecoaItemTable.question,
        responseOptions: ecoaItemTable.responseOptions,
      })
      .from(ecoaItemTable)
      .innerJoin(ecoaScaleTable, eq(ecoaItemTable.scaleId, ecoaScaleTable.id))
      .where(eq(ecoaScaleTable.acronym, 'PHQ-9'))
      .orderBy(ecoaItemTable.itemNumber);

    return NextResponse.json({
      success: true,
      scalesWithItems,
      phq9Items: phq9Items.map(item => ({
        ...item,
        responseOptions: item.responseOptions || '[]'
      })),
      totalScales: scalesWithItems.length,
      scalesWithoutItems: scalesWithItems.filter(s => s.actualItems === 0).length
    });

  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json(
      { error: 'Failed to debug database', details: error.message },
      { status: 500 }
    );
  }
}