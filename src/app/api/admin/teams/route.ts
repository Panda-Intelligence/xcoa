import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { teamTable, userTable } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// Admin获取团队列表 (用于发票创建时选择)
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

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // 构建查询
    let query = db
      .select({
        id: teamTable.id,
        name: teamTable.name,
        slug: teamTable.slug,
        description: teamTable.description,
        billingEmail: teamTable.billingEmail,
        legalName: teamTable.legalName,
      })
      .from(teamTable);

    // 添加搜索
    if (search) {
      query = query.where(
        or(
          like(teamTable.name, `%${search}%`),
          like(teamTable.slug, `%${search}%`),
          like(teamTable.legalName, `%${search}%`),
          like(teamTable.billingEmail, `%${search}%`)
        )
      );
    }

    const teams = await query.limit(limit);

    return NextResponse.json({
      success: true,
      teams
    });

  } catch (error) {
    console.error('获取团队列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}