import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable, ecoaScaleTable, userTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // 权限检查：必须是管理员
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let query = db
      .select({
        id: scaleInterpretationTable.id,
        scaleId: scaleInterpretationTable.scaleId,
        scaleName: ecoaScaleTable.name,
        scaleAcronym: ecoaScaleTable.acronym,
        overview: scaleInterpretationTable.overview,
        structure: scaleInterpretationTable.structure,
        psychometricProperties: scaleInterpretationTable.psychometricProperties,
        interpretation: scaleInterpretationTable.interpretation,
        usageGuidelines: scaleInterpretationTable.usageGuidelines,
        clinicalApplications: scaleInterpretationTable.clinicalApplications,
        status: scaleInterpretationTable.status,
        generationMethod: scaleInterpretationTable.generationMethod,
        aiModel: scaleInterpretationTable.aiModel,
        aiTokensUsed: scaleInterpretationTable.aiTokensUsed,
        version: scaleInterpretationTable.version,
        needsVerification: scaleInterpretationTable.needsVerification,
        createdAt: scaleInterpretationTable.createdAt,
        reviewNotes: scaleInterpretationTable.reviewNotes,
      })
      .from(scaleInterpretationTable)
      .leftJoin(ecoaScaleTable, eq(scaleInterpretationTable.scaleId, ecoaScaleTable.id));

    if (status !== 'all') {
      query = query.where(eq(scaleInterpretationTable.status, status)) as typeof query;
    }

    const interpretations = await query;

    const stats = await db
      .select({
        total: sql<number>`COUNT(*)`.as('total'),
        draft: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'draft' THEN 1 ELSE 0 END)`.as('draft'),
        reviewing: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'reviewing' THEN 1 ELSE 0 END)`.as('reviewing'),
        approved: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'approved' THEN 1 ELSE 0 END)`.as('approved'),
        published: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'published' THEN 1 ELSE 0 END)`.as('published'),
      })
      .from(scaleInterpretationTable);

    const formattedInterpretations = interpretations.map(item => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      interpretations: formattedInterpretations,
      stats: stats[0] || { total: 0, draft: 0, reviewing: 0, approved: 0, published: 0 },
    });
  } catch (error) {
    const err = error as { message: string };
    console.error('Failed to fetch interpretations:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to fetch interpretations',
      },
      { status: 500 }
    );
  }
}
