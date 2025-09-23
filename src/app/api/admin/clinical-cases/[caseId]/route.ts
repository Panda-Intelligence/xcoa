import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { clinicalCasesTable, userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateCaseSchema = z.object({
  title: z.string().optional(),
  patientBackground: z.string().optional(),
  interpretation: z.string().optional(),
  clinicalDecision: z.string().optional(),
  outcome: z.string().optional(),
  learningPoints: z.string().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  specialty: z.string().optional(),
  author: z.string().optional(),
  reviewStatus: z.enum(['draft', 'reviewed', 'published']).optional()
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    
    // 检查是否为管理员
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { caseId } = params;

    // 获取案例详情
    const clinicalCase = await db
      .select()
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    if (clinicalCase.length === 0) {
      return NextResponse.json({ error: 'Clinical case not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      case: clinicalCase[0]
    });

  } catch (error) {
    console.error('Admin获取案例详情错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    
    // 检查是否为管理员
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { caseId } = params;
    const body = await request.json();
    const updateData = updateCaseSchema.parse(body);

    // 检查案例是否存在
    const clinicalCase = await db
      .select()
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    if (clinicalCase.length === 0) {
      return NextResponse.json({ error: 'Clinical case not found' }, { status: 404 });
    }

    // 构建更新数据
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (updateData.title) updateFields.caseTitle = updateData.title;
    if (updateData.patientBackground !== undefined) updateFields.patientBackground = updateData.patientBackground;
    if (updateData.interpretation !== undefined) updateFields.interpretation = updateData.interpretation;
    if (updateData.clinicalDecision !== undefined) updateFields.clinicalDecision = updateData.clinicalDecision;
    if (updateData.outcome !== undefined) updateFields.outcome = updateData.outcome;
    if (updateData.learningPoints !== undefined) updateFields.learningPoints = updateData.learningPoints;
    if (updateData.difficultyLevel) updateFields.difficultyLevel = updateData.difficultyLevel;
    if (updateData.specialty !== undefined) updateFields.specialty = updateData.specialty;
    if (updateData.author !== undefined) updateFields.author = updateData.author;
    if (updateData.reviewStatus) updateFields.reviewStatus = updateData.reviewStatus;

    // 执行更新
    await db
      .update(clinicalCasesTable)
      .set(updateFields)
      .where(eq(clinicalCasesTable.id, caseId));

    // 获取更新后的案例
    const updatedCase = await db
      .select()
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '案例更新成功',
      case: updatedCase[0]
    });

  } catch (error) {
    console.error('Admin更新案例错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid case data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    
    // 检查是否为管理员
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { caseId } = params;

    // 检查案例状态，只有草稿状态可以删除
    const clinicalCase = await db
      .select({ reviewStatus: clinicalCasesTable.reviewStatus })
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    if (clinicalCase.length === 0) {
      return NextResponse.json({ error: 'Clinical case not found' }, { status: 404 });
    }

    if (clinicalCase[0].reviewStatus !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft cases can be deleted' },
        { status: 400 }
      );
    }

    // 删除案例
    await db
      .delete(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId));

    return NextResponse.json({
      success: true,
      message: '案例删除成功'
    });

  } catch (error) {
    console.error('Admin删除案例错误:', error);
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    );
  }
}