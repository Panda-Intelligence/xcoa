import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { copyrightHolderTable, userTable, ecoaScaleTable } from '@/db/schema';
import { eq, like, or, sql, desc } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const createCopyrightHolderSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional(),
  organizationType: z.enum(['publisher', 'research_institution', 'individual', 'foundation']),
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
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
});

// Admin获取版权方列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员
    const db = getDB();
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 获取查询参数
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 构建查询
    let query = db
      .select({
        id: copyrightHolderTable.id,
        name: copyrightHolderTable.name,
        nameEn: copyrightHolderTable.nameEn,
        organizationType: copyrightHolderTable.organizationType,
        website: copyrightHolderTable.website,
        description: copyrightHolderTable.description,
        descriptionEn: copyrightHolderTable.descriptionEn,
        contactEmail: copyrightHolderTable.contactEmail,
        contactPhone: copyrightHolderTable.contactPhone,
        contactMobile: copyrightHolderTable.contactMobile,
        contactFax: copyrightHolderTable.contactFax,
        contactAddress: copyrightHolderTable.contactAddress,
        licenseRequirements: copyrightHolderTable.licenseRequirements,
        pricingInfo: copyrightHolderTable.pricingInfo,
        isActive: copyrightHolderTable.isActive,
        isVerified: copyrightHolderTable.isVerified,
        createdAt: copyrightHolderTable.createdAt,
        updatedAt: copyrightHolderTable.updatedAt,
        // 统计关联的量表数量
        scalesCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${ecoaScaleTable} 
          WHERE ${ecoaScaleTable.copyrightHolderId} = ${copyrightHolderTable.id}
        )`,
      })
      .from(copyrightHolderTable);

    // 添加类型筛选
    if (type !== 'all') {
      query = query.where(eq(copyrightHolderTable.organizationType, type));
    }

    // 添加状态筛选
    if (status === 'active') {
      query = query.where(eq(copyrightHolderTable.isActive, 1));
    } else if (status === 'verified') {
      query = query.where(eq(copyrightHolderTable.isVerified, 1));
    }

    // 添加搜索
    if (search) {
      query = query.where(
        or(
          like(copyrightHolderTable.name, `%${search}%`),
          like(copyrightHolderTable.nameEn, `%${search}%`),
          like(copyrightHolderTable.contactEmail, `%${search}%`)
        )
      );
    }

    const holders = await query
      .orderBy(desc(copyrightHolderTable.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取统计信息
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(copyrightHolderTable);

    const statusStatsResult = await db
      .select({
        organizationType: copyrightHolderTable.organizationType,
        isActive: copyrightHolderTable.isActive,
        isVerified: copyrightHolderTable.isVerified,
        count: sql<number>`count(*)`
      })
      .from(copyrightHolderTable)
      .groupBy(
        copyrightHolderTable.organizationType,
        copyrightHolderTable.isActive,
        copyrightHolderTable.isVerified
      );

    const statistics = {
      total: totalCountResult?.[0]?.count || 0,
      active: statusStatsResult?.filter(s => s.isActive === 1).reduce((sum, s) => sum + (s.count || 0), 0) || 0,
      verified: statusStatsResult?.filter(s => s.isVerified === 1).reduce((sum, s) => sum + (s.count || 0), 0) || 0,
      publishers: statusStatsResult?.filter(s => s.organizationType === 'publisher').reduce((sum, s) => sum + (s.count || 0), 0) || 0,
      institutions: statusStatsResult?.filter(s => s.organizationType === 'research_institution').reduce((sum, s) => sum + (s.count || 0), 0) || 0,
    };

    return NextResponse.json({
      success: true,
      holders,
      statistics,
      pagination: {
        total: totalCountResult?.[0]?.count || 0,
        limit,
        offset,
        hasMore: (totalCountResult?.[0]?.count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('获取版权方列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch copyright holders' },
      { status: 500 }
    );
  }
}

// Admin创建版权方
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const holderData = createCopyrightHolderSchema.parse(body);

    // 检查名称是否已存在
    const existingHolder = await db
      .select()
      .from(copyrightHolderTable)
      .where(eq(copyrightHolderTable.name, holderData.name))
      .limit(1);

    if (existingHolder.length > 0) {
      return NextResponse.json(
        { error: 'Copyright holder with this name already exists' },
        { status: 400 }
      );
    }

    // 创建版权方记录
    await db.insert(copyrightHolderTable).values({
      name: holderData.name,
      nameEn: holderData.nameEn || null,
      organizationType: holderData.organizationType,
      website: holderData.website || null,
      description: holderData.description || null,
      descriptionEn: holderData.descriptionEn || null,
      contactEmail: holderData.contactEmail || null,
      contactPhone: holderData.contactPhone || null,
      contactMobile: holderData.contactMobile || null,
      contactFax: holderData.contactFax || null,
      contactAddress: holderData.contactAddress || null,
      licenseRequirements: holderData.licenseRequirements || null,
      pricingInfo: holderData.pricingInfo || null,
      isActive: holderData.isActive ? 1 : 0,
      isVerified: holderData.isVerified ? 1 : 0,
      licenseTypes: [],
    });

    return NextResponse.json({
      success: true,
      message: '版权方创建成功',
    });

  } catch (error) {
    console.error('Admin创建版权方错误:', error);
    return NextResponse.json(
      { error: 'Failed to create copyright holder' },
      { status: 500 }
    );
  }
}