import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { 
  ecoaScaleTable, 
  userTable, 
  copyrightLicensesTable, 
  ecoaItemTable, 
  userFavoriteTable,
  scaleUsageTable,
  copyrightContactRequestTable,
  clinicalCasesTable,
  scaleNormsTable,
  scaleInterpretationsTable,
  scaleGuidelinesTable,
  scaleFavoriteStatsTable,
  userScaleFavoritesTable,
  userCollectionsTable
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateScaleSchema = z.object({
  name: z.string().optional(),
  nameEn: z.string().optional(),
  acronym: z.string().optional(),
  description: z.string().optional(),
  administrationTime: z.number().optional(),
  targetPopulation: z.string().optional(),
  ageRange: z.string().optional(),
  validationStatus: z.enum(['draft', 'validated', 'published']).optional(),
  copyrightInfo: z.string().optional(),
  // Copyright license fields (for separate table)
  copyrightHolderId: z.string().optional(),
  licenseType: z.enum(['public_domain', 'open_source', 'academic_free', 'commercial', 'restricted', 'contact_required']).optional(),
  licenseTerms: z.string().optional(),
  usageRestrictions: z.string().optional()
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
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
    const { scaleId } = params;

    // 获取量表详情
    const scale = await db
      .select({
        ...ecoaScaleTable,
        // Copyright license info from separate table
        copyrightHolderName: copyrightLicensesTable.copyrightHolder,
        licenseType: copyrightLicensesTable.licenseType,
        licenseTerms: copyrightLicensesTable.licenseTerms,
        usageRestrictions: copyrightLicensesTable.usageRestrictions,
      })
      .from(ecoaScaleTable)
      .leftJoin(copyrightLicensesTable, eq(ecoaScaleTable.id, copyrightLicensesTable.scaleId))
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      scale: scale[0]
    });

  } catch (error) {
    console.error('Admin获取量表详情错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scale details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
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
    const { scaleId } = params;
    const body = await request.json();
    const updateData = updateScaleSchema.parse(body);

    // 检查量表是否存在
    const scale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
    }

    // 构建更新数据
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.nameEn !== undefined) updateFields.nameEn = updateData.nameEn;
    if (updateData.acronym !== undefined) updateFields.acronym = updateData.acronym;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.administrationTime !== undefined) updateFields.administrationTime = updateData.administrationTime;
    if (updateData.targetPopulation !== undefined) updateFields.targetPopulation = updateData.targetPopulation;
    if (updateData.ageRange !== undefined) updateFields.ageRange = updateData.ageRange;
    if (updateData.validationStatus) updateFields.validationStatus = updateData.validationStatus;
    if (updateData.copyrightInfo !== undefined) updateFields.copyrightInfo = updateData.copyrightInfo;

    // Copyright fields directly in ecoaScaleTable
    if (updateData.copyrightHolderId !== undefined) updateFields.copyrightHolderId = updateData.copyrightHolderId;
    if (updateData.licenseType !== undefined) updateFields.licenseType = updateData.licenseType;
    if (updateData.licenseTerms !== undefined) updateFields.licenseTerms = updateData.licenseTerms;
    if (updateData.usageRestrictions !== undefined) updateFields.usageRestrictions = updateData.usageRestrictions;

    // 执行量表信息更新
    await db
      .update(ecoaScaleTable)
      .set(updateFields)
      .where(eq(ecoaScaleTable.id, scaleId));

    // 获取更新后的量表
    const updatedScale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '量表更新成功',
      scale: updatedScale[0]
    });

  } catch (error) {
    console.error('Admin更新量表错误:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid scale data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update scale' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
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
    const { scaleId } = params;

    // 检查量表状态，只有草稿状态可以删除
    const scale = await db
      .select({ validationStatus: ecoaScaleTable.validationStatus })
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
    }

    // 删除所有关联数据，然后删除量表
    // 注意：D1 不支持 drizzle 的 transaction API，所以按顺序删除
    
    // 1. 删除量表题目
    await db
      .delete(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, scaleId));

    // 2. 删除用户收藏
    await db
      .delete(userFavoriteTable)
      .where(eq(userFavoriteTable.scaleId, scaleId));

    // 3. 删除用户收藏统计（如果存在）
    await db
      .delete(userScaleFavoritesTable)
      .where(eq(userScaleFavoritesTable.scaleId, scaleId));

    // 4. 删除量表使用记录
    await db
      .delete(scaleUsageTable)
      .where(eq(scaleUsageTable.scaleId, scaleId));

    // 5. 删除版权联系请求
    await db
      .delete(copyrightContactRequestTable)
      .where(eq(copyrightContactRequestTable.scaleId, scaleId));

    // 6. 删除版权许可
    await db
      .delete(copyrightLicensesTable)
      .where(eq(copyrightLicensesTable.scaleId, scaleId));

    // 7. 删除临床案例
    await db
      .delete(clinicalCasesTable)
      .where(eq(clinicalCasesTable.scaleId, scaleId));

    // 8. 删除量表常模
    await db
      .delete(scaleNormsTable)
      .where(eq(scaleNormsTable.scaleId, scaleId));

    // 9. 删除量表解释
    await db
      .delete(scaleInterpretationsTable)
      .where(eq(scaleInterpretationsTable.scaleId, scaleId));

    // 10. 删除量表指导
    await db
      .delete(scaleGuidelinesTable)
      .where(eq(scaleGuidelinesTable.scaleId, scaleId));

    // 11. 删除收藏统计
    await db
      .delete(scaleFavoriteStatsTable)
      .where(eq(scaleFavoriteStatsTable.scaleId, scaleId));

    // 12. 最后删除量表
    await db
      .delete(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId));

    return NextResponse.json({
      success: true,
      message: '量表删除成功'
    });

  } catch (error) {
    console.error('Admin删除量表错误:', error);
    return NextResponse.json(
      { error: 'Failed to delete scale' },
      { status: 500 }
    );
  }
}