import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable } from '@/db/schema';
import { getSessionFromCookie } from '@/utils/auth';
import { ComplianceChecker, RateLimiter, ContentParser, DATA_SOURCES } from '@/utils/scraping/data-collector';
import { z } from 'zod';

const collectionRequestSchema = z.object({
  sourceIds: z.array(z.string()).optional(),
  maxPages: z.number().min(1).max(100).default(10),
  dryRun: z.boolean().default(true), // 默认为测试模式
  respectRateLimit: z.boolean().default(true)
});

// 启动数据收集
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const config = collectionRequestSchema.parse(body);

    const complianceChecker = new ComplianceChecker();
    const rateLimiter = new RateLimiter();
    const parser = new ContentParser();

    const results = [];
    const errors = [];

    // 选择要收集的数据源
    const selectedSources = config.sourceIds
      ? DATA_SOURCES.filter(source => config.sourceIds!.includes(source.id))
      : DATA_SOURCES;

    for (const source of selectedSources) {
      try {
        console.log(`开始收集数据源: ${source.name}`);

        // 1. 合规性检查
        const compliance = await complianceChecker.checkRobotsTxt(source.baseUrl);
        if (!compliance.allowed) {
          errors.push({
            source: source.id,
            error: `合规检查失败: ${compliance.reason}`,
            type: 'compliance'
          });
          continue;
        }

        // 2. 获取主页内容
        const mainPageResponse = await rateLimiter.fetch(source.baseUrl);
        if (mainPageResponse.status !== 200) {
          errors.push({
            source: source.id,
            error: `无法访问主页: HTTP ${mainPageResponse.status}`,
            type: 'network'
          });
          continue;
        }

        // 3. 解析量表信息（模拟解析）
        const scaleInfo = parser.extractScaleInfo(mainPageResponse.html, source.selectors);

        // 4. 数据质量检查
        if (!scaleInfo.name || !scaleInfo.acronym) {
          errors.push({
            source: source.id,
            error: '缺少必要的量表信息',
            type: 'data_quality'
          });
          continue;
        }

        // 5. 如果是测试模式，不写入数据库
        if (config.dryRun) {
          results.push({
            source: source.id,
            data: scaleInfo,
            status: 'dry_run_success',
            qualityScore: 0.8 // 模拟质量分数
          });
        } else {
          // 写入数据库（实际实现）
          const db = getDB();

          // 检查是否已存在
          const existing = await db
            .select()
            .from(ecoaScaleTable)
            .where(eq(ecoaScaleTable.acronym, scaleInfo.acronym!))
            .limit(1);

          if (existing.length === 0) {
            // 插入新量表
            await db.insert(ecoaScaleTable).values({
              name: scaleInfo.name!,
              nameEn: scaleInfo.nameEn,
              acronym: scaleInfo.acronym!,
              description: scaleInfo.description!,
              descriptionEn: scaleInfo.descriptionEn,
              categoryId: 'cat_collected', // 收集的数据使用特殊分类
              administrationTime: scaleInfo.administrationTime,
              itemsCount: scaleInfo.itemsCount,
              targetPopulation: scaleInfo.targetPopulation,
              validationStatus: 'draft', // 收集的数据默认为草稿状态
              copyrightInfo: scaleInfo.copyrightInfo,
              isPublic: 0, // 收集的数据默认不公开，需要审核
            });

            results.push({
              source: source.id,
              data: scaleInfo,
              status: 'inserted',
              qualityScore: 0.8
            });
          } else {
            results.push({
              source: source.id,
              data: scaleInfo,
              status: 'duplicate_skipped',
              qualityScore: 0.8
            });
          }
        }

        // 添加延迟以遵守速率限制
        if (config.respectRateLimit) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`收集数据源 ${source.id} 错误:`, error);
        errors.push({
          source: source.id,
          error: error.message,
          type: 'processing'
        });
      }
    }

    // 生成收集报告
    const report = {
      summary: {
        totalSources: selectedSources.length,
        successfulSources: results.length,
        failedSources: errors.length,
        totalScalesFound: results.length,
        averageQuality: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length || 0
      },
      results,
      errors,
      config,
      timestamp: new Date().toISOString(),
      dryRun: config.dryRun
    };

    return NextResponse.json({
      success: true,
      message: config.dryRun ? '测试运行完成' : '数据收集完成',
      report
    });

  } catch (error) {
    console.error('数据收集错误:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid collection config', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start data collection' },
      { status: 500 }
    );
  }
}

// 获取收集状态和历史
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 模拟收集历史数据
    const collectionHistory = [
      {
        id: 'collect_001',
        timestamp: '2024-09-21T10:00:00Z',
        sources: ['usecoa', 'chinecoa'],
        status: 'completed',
        scalesFound: 15,
        scalesAdded: 12,
        duplicates: 3,
        errors: 0,
        qualityScore: 0.85,
        dryRun: false
      },
      {
        id: 'collect_002',
        timestamp: '2024-09-20T14:30:00Z',
        sources: ['mapi-trust'],
        status: 'completed',
        scalesFound: 8,
        scalesAdded: 7,
        duplicates: 1,
        errors: 0,
        qualityScore: 0.92,
        dryRun: true
      }
    ];

    const statistics = {
      totalCollections: collectionHistory.length,
      totalScalesCollected: collectionHistory.reduce((sum, h) => sum + h.scalesAdded, 0),
      averageQuality: collectionHistory.reduce((sum, h) => sum + h.qualityScore, 0) / collectionHistory.length,
      lastCollection: collectionHistory[0]?.timestamp,
      activeSources: DATA_SOURCES.length,
      pendingReview: 5 // 待审核的量表数量
    };

    return NextResponse.json({
      success: true,
      statistics,
      history: collectionHistory,
      availableSources: DATA_SOURCES.map(source => ({
        id: source.id,
        name: source.name,
        type: source.type,
        priority: source.priority,
        baseUrl: source.baseUrl
      }))
    });

  } catch (error) {
    console.error('获取收集状态错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection status' },
      { status: 500 }
    );
  }
}