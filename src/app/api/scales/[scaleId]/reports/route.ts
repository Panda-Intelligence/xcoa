import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  scaleReportTable,
  scaleResponseTable,
  ecoaScaleTable,
  ecoaItemTable,
  reportTemplateTable,
  REPORT_STATUS,
  REPORT_TYPE,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { calculateScores, validateScoring } from '@/utils/scoring';

interface ReportGenerationRequest {
  sessionId: string;
  templateId?: string;
  reportType?: 'text' | 'pdf' | 'html';
  includeCharts?: boolean;
  includeInterpretation?: boolean;
  includeRecommendations?: boolean;
}

/**
 * POST /api/scales/[scaleId]/reports/generate
 * Generate assessment report from user responses
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    // Check authentication
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to generate reports' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { scaleId } = params;
    const userId = session.user.id;

    // Parse request body
    const body = await request.json() as ReportGenerationRequest;

    if (!body.sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const db = getDB();

    // 1. Fetch scale data
    const scale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json(
        { error: 'Scale not found' },
        { status: 404 }
      );
    }

    const scaleData = scale[0];

    // 2. Fetch scale items
    const items = await db
      .select()
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, scaleId))
      .orderBy(ecoaItemTable.sortOrder);

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No items found for this scale' },
        { status: 404 }
      );
    }

    // 3. Fetch user responses
    const responses = await db
      .select()
      .from(scaleResponseTable)
      .where(and(
        eq(scaleResponseTable.userId, userId),
        eq(scaleResponseTable.scaleId, scaleId),
        eq(scaleResponseTable.sessionId, body.sessionId)
      ))
      .orderBy(scaleResponseTable.itemNumber);

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for this session' },
        { status: 404 }
      );
    }

    // 4. Validate scoring
    const validation = validateScoring(scaleData, items, responses);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Scoring validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // 5. Calculate scores
    const scoringResult = await calculateScores(scaleData, items, responses);

    // 6. Fetch template if specified
    let template = null;
    if (body.templateId) {
      const templateResult = await db
        .select()
        .from(reportTemplateTable)
        .where(eq(reportTemplateTable.id, body.templateId))
        .limit(1);

      if (templateResult.length > 0) {
        template = templateResult[0];
      }
    } else {
      // Try to get default template for this scale
      const defaultTemplate = await db
        .select()
        .from(reportTemplateTable)
        .where(and(
          eq(reportTemplateTable.scaleId, scaleId),
          eq(reportTemplateTable.isDefault, 1),
          eq(reportTemplateTable.isActive, 1)
        ))
        .limit(1);

      if (defaultTemplate.length > 0) {
        template = defaultTemplate[0];
      }
    }

    // 7. Generate report content
    const reportContent = generateReportContent(
      scaleData,
      scoringResult,
      template,
      body
    );

    // 8. Prepare chart data
    const chartData = prepareChartData(scoringResult, scaleData);

    // 9. Create report record
    const reportType = body.reportType || REPORT_TYPE.PDF;

    const report = await db
      .insert(scaleReportTable)
      .values({
        userId,
        scaleId,
        sessionId: body.sessionId,
        templateId: template?.id || null,
        reportType,
        status: REPORT_STATUS.COMPLETED,
        totalScore: scoringResult.totalScore,
        maxScore: scoringResult.maxScore,
        completionRate: scoringResult.completionRate,
        dimensionScores: scoringResult.dimensionScores,
        interpretation: scoringResult.interpretation,
        recommendations: scoringResult.recommendations,
        reportContent,
        chartData,
        metadata: {
          scoringMethod: scoringResult.scoringMethod,
          severity: scoringResult.severity,
          generatedBy: 'auto',
          version: '1.0',
        },
        generatedAt: new Date(),
        // Set expiration to 1 year from now
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .returning();

    // 10. Return report
    return NextResponse.json({
      success: true,
      report: {
        id: report[0].id,
        scaleId,
        scaleName: scaleData.name,
        sessionId: body.sessionId,
        reportType,
        status: REPORT_STATUS.COMPLETED,
        totalScore: scoringResult.totalScore,
        maxScore: scoringResult.maxScore,
        completionRate: scoringResult.completionRate,
        dimensionScores: scoringResult.dimensionScores,
        interpretation: scoringResult.interpretation,
        severity: scoringResult.severity,
        recommendations: scoringResult.recommendations,
        chartData,
        generatedAt: report[0].generatedAt,
        reportUrl: `/dashboard/reports/${report[0].id}`,
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scales/[scaleId]/reports
 * Get user's reports for this scale
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { scaleId } = params;
    const userId = session.user.id;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    const db = getDB();

    // Build query conditions
    let conditions = [
      eq(scaleReportTable.userId, userId),
      eq(scaleReportTable.scaleId, scaleId)
    ];

    if (sessionId) {
      conditions.push(eq(scaleReportTable.sessionId, sessionId));
    }

    // Fetch reports
    const reports = await db
      .select()
      .from(scaleReportTable)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(scaleReportTable.generatedAt);

    // Get scale info
    const scale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    return NextResponse.json({
      success: true,
      scaleId,
      scaleName: scale[0]?.name || 'Unknown',
      totalReports: reports.length,
      reports: reports.map(r => ({
        id: r.id,
        sessionId: r.sessionId,
        reportType: r.reportType,
        status: r.status,
        totalScore: r.totalScore,
        maxScore: r.maxScore,
        completionRate: r.completionRate,
        interpretation: r.interpretation,
        generatedAt: r.generatedAt,
        reportUrl: `/dashboard/reports/${r.id}`,
      })),
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// Helper functions

function generateReportContent(
  scale: any,
  scoringResult: any,
  template: any | null,
  options: ReportGenerationRequest
): string {
  const sections: string[] = [];

  // Header
  sections.push(`# ${scale.name} 评估报告\n`);
  sections.push(`**评估日期**: ${new Date().toLocaleDateString('zh-CN')}\n\n`);

  // Score Summary
  sections.push('## 评分概要\n');
  sections.push(`- **总分**: ${scoringResult.totalScore} / ${scoringResult.maxScore}`);
  sections.push(`- **完成率**: ${scoringResult.completionRate.toFixed(1)}%`);
  sections.push(`- **评估结果**: ${scoringResult.interpretation}`);
  sections.push(`- **严重程度**: ${scoringResult.severity}\n\n`);

  // Dimension Scores
  if (Object.keys(scoringResult.dimensionScores).length > 1) {
    sections.push('## 维度得分\n');
    for (const [dimension, score] of Object.entries(scoringResult.dimensionScores)) {
      const dimScore = score as any;
      sections.push(`### ${dimension}`);
      sections.push(`- 得分: ${dimScore.score} / ${dimScore.maxScore} (${dimScore.percentage.toFixed(1)}%)`);
      sections.push(`- 题目数: ${dimScore.itemCount}\n`);
    }
    sections.push('\n');
  }

  // Interpretation
  if (options.includeInterpretation !== false && scoringResult.interpretation) {
    sections.push('## 结果解读\n');
    sections.push(`${scoringResult.interpretation}\n\n`);
  }

  // Recommendations
  if (options.includeRecommendations !== false && scoringResult.recommendations) {
    sections.push('## 建议\n');
    for (const rec of scoringResult.recommendations) {
      sections.push(`- ${rec}`);
    }
    sections.push('\n\n');
  }

  // Footer
  sections.push('---\n');
  sections.push('*本报告由 OpeneCOA 系统自动生成，仅供参考。具体诊断和治疗方案请咨询专业医师。*\n');

  return sections.join('\n');
}

function prepareChartData(scoringResult: any, scale: any): Record<string, any> {
  const chartData: Record<string, any> = {
    totalScore: {
      type: 'gauge',
      value: scoringResult.totalScore,
      max: scoringResult.maxScore,
      percentage: (scoringResult.totalScore / scoringResult.maxScore) * 100,
    },
    dimensionScores: {
      type: 'radar',
      data: Object.entries(scoringResult.dimensionScores).map(([dimension, score]: [string, any]) => ({
        dimension,
        score: score.score,
        maxScore: score.maxScore,
        percentage: score.percentage,
      })),
    },
    completionRate: {
      type: 'progress',
      value: scoringResult.completionRate,
    },
  };

  return chartData;
}
