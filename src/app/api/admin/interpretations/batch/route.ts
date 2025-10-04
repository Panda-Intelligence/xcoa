import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable, interpretationHistoryTable } from '@/db/schema';
import { inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action, notes } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid interpretation IDs' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'publish', 'delete', 'request-changes'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    const db = getDB();

    const interpretations = await db
      .select()
      .from(scaleInterpretationTable)
      .where(inArray(scaleInterpretationTable.id, ids));

    if (interpretations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No interpretations found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let changeType = '';
    let changeSummary = '';

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          reviewedAt: new Date(),
          reviewNotes: notes,
          updatedAt: new Date(),
        };
        changeType = 'review';
        changeSummary = '批量审核通过';
        break;

      case 'publish':
        const canPublish = interpretations.every(i => i.status === 'approved');
        if (!canPublish) {
          return NextResponse.json(
            { success: false, message: 'Only approved interpretations can be published' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        };
        changeType = 'publish';
        changeSummary = '批量发布';
        break;

      case 'request-changes':
        if (!notes) {
          return NextResponse.json(
            { success: false, message: 'Review notes are required for requesting changes' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'draft',
          reviewNotes: notes,
          reviewedAt: new Date(),
          needsVerification: 1,
          updatedAt: new Date(),
        };
        changeType = 'review';
        changeSummary = '批量要求修改';
        break;

      case 'delete':
        await db
          .delete(scaleInterpretationTable)
          .where(inArray(scaleInterpretationTable.id, ids));
        
        return NextResponse.json({
          success: true,
          affected: ids.length,
          action: 'delete',
        });
    }

    await db
      .update(scaleInterpretationTable)
      .set(updateData)
      .where(inArray(scaleInterpretationTable.id, ids));

    for (const interpretation of interpretations) {
      await db.insert(interpretationHistoryTable).values({
        interpretationId: interpretation.id,
        version: interpretation.version + 1,
        changes: JSON.stringify({
          type: action,
          ids,
          notes,
        }),
        changeType,
        changeSummary,
        changedBy: 'system',
      });
    }

    return NextResponse.json({
      success: true,
      affected: ids.length,
      action,
    });
  } catch (error) {
    const err = error as { message: string };
    console.error('Failed to perform batch operation:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to perform batch operation',
      },
      { status: 500 }
    );
  }
}
