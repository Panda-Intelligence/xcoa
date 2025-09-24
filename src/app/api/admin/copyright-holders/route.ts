import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { copyrightHolderTable, userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// Admin获取版权方列表
export async function GET() {
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

    // 获取版权方列表
    const copyrightHolders = await db
      .select({
        id: copyrightHolderTable.id,
        name: copyrightHolderTable.name,
        nameEn: copyrightHolderTable.nameEn,
        organizationType: copyrightHolderTable.organizationType,
        website: copyrightHolderTable.website,
        description: copyrightHolderTable.description,
        contactEmail: copyrightHolderTable.contactEmail,
        isActive: copyrightHolderTable.isActive,
        isVerified: copyrightHolderTable.isVerified,
      })
      .from(copyrightHolderTable)
      .where(eq(copyrightHolderTable.isActive, 1))
      .orderBy(copyrightHolderTable.name);

    return NextResponse.json({
      success: true,
      copyrightHolders
    });

  } catch (error) {
    console.error('获取版权方列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch copyright holders' },
      { status: 500 }
    );
  }
}