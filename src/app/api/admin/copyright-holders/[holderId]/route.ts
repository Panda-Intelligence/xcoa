import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { copyrightHolderTable, userTable, ecoaScaleTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateCopyrightHolderSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().optional(),
  organizationType: z.enum(['publisher', 'research_institution', 'individual', 'foundation']).optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactMobile: z.string().optional(),
  contactFax: z.string().optional(),
  contactAddress: z.string().optional(),
  licenseRequirements: z.string().optional(),
  pricingInfo: z.string().optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ holderId: string }> }
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
    const { holderId } = params;

    // 获取版权方详情
    const holder = await db
      .select({
        ...copyrightHolderTable,
        scalesCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${ecoaScaleTable} 
          WHERE ${ecoaScaleTable.copyrightHolderId} = ${copyrightHolderTable.id}
        )`,
      })
      .from(copyrightHolderTable)
      .where(eq(copyrightHolderTable.id, holderId))
      .limit(1);

    if (holder.length === 0) {
      return NextResponse.json({ error: 'Copyright holder not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      holder: holder[0]
    });

  } catch (error) {
    console.error('获取版权方详情错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch copyright holder details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ holderId: string }> }
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
    const { holderId } = params;
    const body = await request.json();
    const updateData = updateCopyrightHolderSchema.parse(body);

    // 检查版权方是否存在
    const holder = await db
      .select()
      .from(copyrightHolderTable)
      .where(eq(copyrightHolderTable.id, holderId))
      .limit(1);

    if (holder.length === 0) {
      return NextResponse.json({ error: 'Copyright holder not found' }, { status: 404 });
    }

    // 如果更新名称，检查是否重复
    if (updateData.name && updateData.name !== holder[0].name) {
      const existingHolder = await db
        .select()
        .from(copyrightHolderTable)
        .where(eq(copyrightHolderTable.name, updateData.name))
        .limit(1);

      if (existingHolder.length > 0) {
        return NextResponse.json(
          { error: 'Copyright holder with this name already exists' },
          { status: 400 }
        );
      }
    }

    // 构建更新数据
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.nameEn !== undefined) updateFields.nameEn = updateData.nameEn;
    if (updateData.organizationType) updateFields.organizationType = updateData.organizationType;
    if (updateData.website !== undefined) updateFields.website = updateData.website;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.descriptionEn !== undefined) updateFields.descriptionEn = updateData.descriptionEn;
    if (updateData.contactEmail !== undefined) updateFields.contactEmail = updateData.contactEmail;
    if (updateData.contactPhone !== undefined) updateFields.contactPhone = updateData.contactPhone;
    if (updateData.contactMobile !== undefined) updateFields.contactMobile = updateData.contactMobile;
    if (updateData.contactFax !== undefined) updateFields.contactFax = updateData.contactFax;
    if (updateData.contactAddress !== undefined) updateFields.contactAddress = updateData.contactAddress;
    if (updateData.licenseRequirements !== undefined) updateFields.licenseRequirements = updateData.licenseRequirements;
    if (updateData.pricingInfo !== undefined) updateFields.pricingInfo = updateData.pricingInfo;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive ? 1 : 0;
    if (updateData.isVerified !== undefined) updateFields.isVerified = updateData.isVerified ? 1 : 0;

    // 执行更新
    await db
      .update(copyrightHolderTable)
      .set(updateFields)
      .where(eq(copyrightHolderTable.id, holderId));

    // 获取更新后的版权方
    const updatedHolder = await db
      .select()
      .from(copyrightHolderTable)
      .where(eq(copyrightHolderTable.id, holderId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '版权方更新成功',
      holder: updatedHolder[0]
    });

  } catch (error) {
    console.error('更新版权方错误:', error);
    return NextResponse.json(
      { error: 'Failed to update copyright holder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ holderId: string }> }
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
    const { holderId } = params;

    // 检查是否有关联的量表
    const relatedScales = await db
      .select({ count: sql<number>`count(*)` })
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.copyrightHolderId, holderId));

    if (relatedScales[0]?.count > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete copyright holder with associated scales',
          message: `该版权方关联了 ${relatedScales[0].count} 个量表，请先解除关联后再删除`
        },
        { status: 400 }
      );
    }

    // 执行删除
    await db
      .delete(copyrightHolderTable)
      .where(eq(copyrightHolderTable.id, holderId));

    return NextResponse.json({
      success: true,
      message: '版权方删除成功'
    });

  } catch (error) {
    console.error('删除版权方错误:', error);
    return NextResponse.json(
      { error: 'Failed to delete copyright holder' },
      { status: 500 }
    );
  }
}