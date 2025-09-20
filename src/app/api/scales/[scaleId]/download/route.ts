import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { 
  ecoaScaleTable, 
  ecoaCategoryTable, 
  ecoaItemTable,
  scaleUsageTable,
  creditTransactionTable
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const downloadParamsSchema = z.object({
  scaleId: z.string(),
});

const downloadRequestSchema = z.object({
  format: z.enum(['pdf', 'excel', 'json', 'txt']).default('pdf'),
  includeItems: z.boolean().default(true),
  includePsychometrics: z.boolean().default(true),
  includeReferences: z.boolean().default(true),
  language: z.enum(['zh-CN', 'en-US', 'both']).default('zh-CN'),
});

// 检查用户是否有下载权限
async function checkDownloadPermission(userId: string, scaleId: string): Promise<boolean> {
  if (!userId) return false;
  
  const db = getDB();
  
  // 检查用户是否有足够的积分或权限
  // 这里简化处理，实际应用中可能需要更复杂的权限检查
  const [recentDownload] = await db
    .select()
    .from(scaleUsageTable)
    .where(
      and(
        eq(scaleUsageTable.userId, userId),
        eq(scaleUsageTable.scaleId, scaleId),
        eq(scaleUsageTable.actionType, 'download')
      )
    )
    .orderBy(desc(scaleUsageTable.createdAt))
    .limit(1);

  // 如果24小时内已下载过，则免费
  if (recentDownload) {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    if (recentDownload.createdAt && recentDownload.createdAt > oneDayAgo) {
      return true;
    }
  }

  // 检查用户积分 (简化：假设每次下载消耗1积分)
  // 实际应用中应该检查 userTable.currentCredits
  return true; // 暂时允许免费下载
}

// 生成不同格式的下载内容
function generateDownloadContent(scale: any, items: any[], format: string, options: any) {
  switch (format) {
    case 'json':
      return {
        contentType: 'application/json',
        filename: `${scale.acronym || scale.id}_${new Date().toISOString().split('T')[0]}.json`,
        content: JSON.stringify({
          scale: {
            ...scale,
            exportedAt: new Date().toISOString(),
            exportFormat: 'json',
          },
          items: options.includeItems ? items : [],
          exportOptions: options,
        }, null, 2)
      };
      
    case 'txt':
      const txtContent = [
        `量表名称: ${scale.name}`,
        `英文名称: ${scale.nameEn || 'N/A'}`,
        `缩写: ${scale.acronym || 'N/A'}`,
        `分类: ${scale.categoryName || 'N/A'}`,
        `题项数量: ${scale.itemsCount || 'N/A'}`,
        `管理时间: ${scale.administrationTime || 'N/A'} 分钟`,
        `适用人群: ${scale.targetPopulation || 'N/A'}`,
        `年龄范围: ${scale.ageRange || 'N/A'}`,
        '',
        `量表描述:`,
        scale.description || 'N/A',
        '',
        options.includeItems && items.length > 0 ? '题项内容:' : '',
        ...items.map((item, index) => 
          `${index + 1}. ${item.question}\n   选项: ${item.responseOptions.join(' / ')}`
        ),
        '',
        options.includePsychometrics && scale.psychometricProperties ? '心理测量学属性:' : '',
        options.includePsychometrics && scale.psychometricProperties ? 
          JSON.stringify(scale.psychometricProperties, null, 2) : '',
        '',
        `导出时间: ${new Date().toLocaleString('zh-CN')}`,
        `导出来源: xCOA (xcoa.pandacat.ai)`,
      ].filter(line => line !== '').join('\n');
      
      return {
        contentType: 'text/plain; charset=utf-8',
        filename: `${scale.acronym || scale.id}_${new Date().toISOString().split('T')[0]}.txt`,
        content: txtContent
      };
      
    case 'excel':
      // 这里可以集成 xlsx 库生成 Excel 文件
      // 暂时返回 CSV 格式作为替代
      const csvContent = [
        'ID,名称,英文名称,缩写,分类,题项数,管理时间,适用人群,验证状态',
        `${scale.id},"${scale.name}","${scale.nameEn}","${scale.acronym}","${scale.categoryName}",${scale.itemsCount},${scale.administrationTime},"${scale.targetPopulation}","${scale.validationStatus}"`,
        '',
        '题项编号,题项内容,英文题项,维度,回答选项',
        ...items.map(item => 
          `${item.itemNumber},"${item.question}","${item.questionEn || ''}","${item.dimension || ''}","${item.responseOptions.join(' / ')}"`
        )
      ].join('\n');
      
      return {
        contentType: 'text/csv; charset=utf-8',
        filename: `${scale.acronym || scale.id}_${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent
      };
      
    case 'pdf':
    default:
      // PDF 生成需要专门的库，这里返回 HTML 格式作为替代
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${scale.name} (${scale.acronym})</title>
          <style>
            body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .items-section { margin-top: 30px; }
            .item { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${scale.name}</h1>
            <h2>${scale.nameEn || ''}</h2>
            <p><strong>缩写:</strong> ${scale.acronym || 'N/A'}</p>
            <p><strong>分类:</strong> ${scale.categoryName || 'N/A'}</p>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <strong>题项数量:</strong> ${scale.itemsCount || 'N/A'}
            </div>
            <div class="info-item">
              <strong>管理时间:</strong> ${scale.administrationTime || 'N/A'} 分钟
            </div>
            <div class="info-item">
              <strong>适用人群:</strong> ${scale.targetPopulation || 'N/A'}
            </div>
            <div class="info-item">
              <strong>验证状态:</strong> ${scale.validationStatus || 'N/A'}
            </div>
          </div>
          
          <div>
            <h3>量表描述</h3>
            <p>${scale.description || 'N/A'}</p>
            ${scale.descriptionEn ? `<p><em>${scale.descriptionEn}</em></p>` : ''}
          </div>
          
          ${options.includeItems && items.length > 0 ? `
          <div class="items-section">
            <h3>题项内容</h3>
            ${items.map(item => `
              <div class="item">
                <h4>题项 ${item.itemNumber}: ${item.question}</h4>
                ${item.questionEn ? `<p><em>${item.questionEn}</em></p>` : ''}
                <p><strong>回答选项:</strong> ${item.responseOptions.join(' / ')}</p>
                ${item.dimension ? `<p><strong>维度:</strong> ${item.dimension}</p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div class="footer">
            <p>导出时间: ${new Date().toLocaleString('zh-CN')}</p>
            <p>导出来源: xCOA (xcoa.pandacat.ai)</p>
            ${scale.copyrightInfo ? `<p>版权信息: ${scale.copyrightInfo}</p>` : ''}
          </div>
        </body>
        </html>
      `;
      
      return {
        contentType: 'text/html; charset=utf-8',
        filename: `${scale.acronym || scale.id}_${new Date().toISOString().split('T')[0]}.html`,
        content: htmlContent
      };
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;
      const ip = getIP(request);
      
      const params = await context.params;
      const { scaleId } = downloadParamsSchema.parse(params);
      
      const body = await request.json();
      const downloadOptions = downloadRequestSchema.parse(body);
      
      // 检查下载权限
      if (user && !(await checkDownloadPermission(user.id, scaleId))) {
        return NextResponse.json(
          { error: 'Insufficient credits or permissions for download' },
          { status: 403 }
        );
      }
      
      // 获取量表详细信息
      const [scale] = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          nameEn: ecoaScaleTable.nameEn,
          acronym: ecoaScaleTable.acronym,
          description: ecoaScaleTable.description,
          descriptionEn: ecoaScaleTable.descriptionEn,
          categoryName: ecoaCategoryTable.name,
          itemsCount: ecoaScaleTable.itemsCount,
          dimensionsCount: ecoaScaleTable.dimensionsCount,
          languages: ecoaScaleTable.languages,
          validationStatus: ecoaScaleTable.validationStatus,
          administrationTime: ecoaScaleTable.administrationTime,
          targetPopulation: ecoaScaleTable.targetPopulation,
          ageRange: ecoaScaleTable.ageRange,
          domains: ecoaScaleTable.domains,
          scoringMethod: ecoaScaleTable.scoringMethod,
          copyrightInfo: ecoaScaleTable.copyrightInfo,
          psychometricProperties: ecoaScaleTable.psychometricProperties,
          references: ecoaScaleTable.references,
        })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(eq(ecoaScaleTable.id, scaleId));

      if (!scale) {
        return NextResponse.json(
          { error: 'Scale not found' },
          { status: 404 }
        );
      }

      // 获取题项信息（如果需要）
      let items: any[] = [];
      if (downloadOptions.includeItems) {
        items = await db
          .select({
            itemNumber: ecoaItemTable.itemNumber,
            question: ecoaItemTable.question,
            questionEn: ecoaItemTable.questionEn,
            dimension: ecoaItemTable.dimension,
            responseType: ecoaItemTable.responseType,
            responseOptions: ecoaItemTable.responseOptions,
            scoringInfo: ecoaItemTable.scoringInfo,
          })
          .from(ecoaItemTable)
          .where(eq(ecoaItemTable.scaleId, scaleId))
          .orderBy(ecoaItemTable.sortOrder, ecoaItemTable.itemNumber);
      }

      // 解析 JSON 字段
      const parsedScale = {
        ...scale,
        languages: Array.isArray(scale.languages) ? scale.languages :
          (scale.languages ? JSON.parse(scale.languages) : []),
        domains: Array.isArray(scale.domains) ? scale.domains :
          (scale.domains ? JSON.parse(scale.domains) : []),
        psychometricProperties: downloadOptions.includePsychometrics && scale.psychometricProperties ?
          (typeof scale.psychometricProperties === 'object' ?
            scale.psychometricProperties :
            JSON.parse(scale.psychometricProperties)) : null,
        references: downloadOptions.includeReferences && scale.references ?
          (Array.isArray(scale.references) ? scale.references :
            JSON.parse(scale.references)) : [],
      };

      const parsedItems = items.map(item => ({
        ...item,
        responseOptions: Array.isArray(item.responseOptions) ? item.responseOptions :
          (item.responseOptions ? JSON.parse(item.responseOptions) : []),
      }));

      // 生成下载内容
      const downloadResult = generateDownloadContent(
        parsedScale, 
        parsedItems, 
        downloadOptions.format, 
        downloadOptions
      );

      // 记录下载行为
      try {
        await db.insert(scaleUsageTable).values({
          scaleId,
          userId: user?.id,
          actionType: 'download',
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || '',
        });
      } catch (error) {
        console.warn('Failed to record download:', error);
      }

      // 返回文件内容
      return new NextResponse(downloadResult.content, {
        status: 200,
        headers: {
          'Content-Type': downloadResult.contentType,
          'Content-Disposition': `attachment; filename="${downloadResult.filename}"`,
          'X-Scale-ID': scaleId,
          'X-Export-Format': downloadOptions.format,
          'X-Export-Time': new Date().toISOString(),
        },
      });

    } catch (error) {
      console.error('Scale download API error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid download parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate download' },
        { status: 500 }
      );
    }
  }, {
    identifier: 'scale-download',
    limit: 20,
    windowInSeconds: 60,
  });
}