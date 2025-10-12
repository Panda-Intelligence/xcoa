import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { getDB } from '@/db';
import { userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AdminProtectedHandler {
  (request: NextRequest, session: NonNullable<Awaited<ReturnType<typeof getSessionFromCookie>>>): Promise<NextResponse>;
}

/**
 * Admin API 权限保护中间件
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   return withAdminAccess(request, async (request, session) => {
 *     // Admin only logic here
 *     return NextResponse.json({ data: '...' });
 *   });
 * }
 */
export async function withAdminAccess(
  request: NextRequest,
  handler: AdminProtectedHandler
): Promise<NextResponse> {
  try {
    // 1. 检查 session
    const session = await getSessionFromCookie();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: '请先登录',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // 2. 检查管理员权限
    const db = getDB();
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: '需要管理员权限',
          code: 'ADMIN_REQUIRED'
        },
        { status: 403 }
      );
    }

    // 3. 执行 handler
    return handler(request, session);
  } catch (error) {
    console.error('Admin access check error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 创建 admin 保护的路由处理器工厂函数
 *
 * @example
 * export const GET = createAdminHandler(async (request, session) => {
 *   return NextResponse.json({ data: '...' });
 * });
 */
export function createAdminHandler(handler: AdminProtectedHandler) {
  return async (request: NextRequest) => {
    return withAdminAccess(request, handler);
  };
}
