import { NextRequest, NextResponse } from 'next/server';
import { checkFeatureAccess, incrementUsage } from '@/services/subscription';
import { getSessionFromCookie } from '@/utils/auth';

export type FeatureType = 'search' | 'scale_view' | 'ai_interpretation' | 'api_call' | 'case_study' | 'data_export';

/**
 * 功能权限检查中间件
 * @param feature 要检查的功能
 * @param autoIncrement 是否自动增加使用量
 */
export function withFeatureAccess(
  feature: FeatureType,
  autoIncrement: boolean = true
) {
  return async function middleware(req: NextRequest) {
    try {
      // 获取用户会话
      const session = await getSessionFromCookie();

      if (!session) {
        return NextResponse.json(
          { error: '请先登录' },
          { status: 401 }
        );
      }

      // 检查功能访问权限
      const accessResult = await checkFeatureAccess(session.userId, feature);

      if (!accessResult.allowed) {
        return NextResponse.json(
          {
            error: accessResult.reason,
            requiresUpgrade: accessResult.requiresUpgrade,
            upgradeUrl: '/pricing'
          },
          { status: 403 }
        );
      }

      // 如果需要，自动增加使用量
      if (autoIncrement && ['search', 'scale_view', 'ai_interpretation', 'api_call'].includes(feature)) {
        await incrementUsage(session.userId, feature as any);
      }

      // 继续处理请求
      return NextResponse.next();
    } catch (error) {
      console.error('Feature access check error:', error);
      return NextResponse.json(
        { error: '权限检查失败' },
        { status: 500 }
      );
    }
  };
}

/**
 * 在API路由中使用的权限检查函数
 */
export async function requireFeatureAccess(
  userId: string,
  feature: FeatureType,
  autoIncrement: boolean = true
): Promise<{ success: boolean; error?: string; requiresUpgrade?: string }> {
  try {
    const accessResult = await checkFeatureAccess(userId, feature);

    if (!accessResult.allowed) {
      return {
        success: false,
        error: accessResult.reason,
        requiresUpgrade: accessResult.requiresUpgrade
      };
    }

    // 自动增加使用量
    if (autoIncrement && ['search', 'scale_view', 'ai_interpretation', 'api_call'].includes(feature)) {
      await incrementUsage(userId, feature as any);
    }

    return { success: true };
  } catch (error) {
    console.error('Feature access check error:', error);
    return {
      success: false,
      error: '权限检查失败'
    };
  }
}