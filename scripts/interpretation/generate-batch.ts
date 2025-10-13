#!/usr/bin/env node
/**
 * 批量生成量表解读内容
 * 
 * Usage:
 *   node scripts/interpretation/generate-batch.js [options]
 * 
 * Options:
 *   --limit <number>    限制生成数量（默认: 10）
 *   --offset <number>   跳过前N个（默认: 0）
 *   --scale-id <id>     只生成指定量表的解读
 *   --force             强制重新生成已有解读
 *   --language <zh|en>  生成语言（默认: zh）
 *   --dry-run           预览但不实际生成
 */

import { getDB } from '../../src/db/index';
import { ecoaScaleTable } from '../../src/db/schemas/scale';
import { scaleInterpretationTable, interpretationHistoryTable } from '../../src/db/schemas/interpretation';
import { getInterpretationGenerator } from '../../src/services/interpretation/ai-generator';
import { eq, sql } from 'drizzle-orm';
import type { ScaleDataForInterpretation } from '../../src/types/interpretation';

interface GenerateOptions {
  limit?: number;
  offset?: number;
  scaleId?: string;
  force?: boolean;
  language?: 'zh' | 'en';
  dryRun?: boolean;
}

async function generateBatch(options: GenerateOptions = {}) {
  const {
    limit = 10,
    offset = 0,
    scaleId,
    force = false,
    language = 'zh',
    dryRun = false,
  } = options;

  console.log('\n🚀 批量生成量表解读\n');
  console.log('配置:', {
    limit,
    offset,
    scaleId: scaleId || '全部',
    force: force ? '是' : '否',
    language: language === 'zh' ? '中文' : 'English',
    dryRun: dryRun ? '是（预览模式）' : '否',
  });
  console.log('');

  const db = getDB();
  const generator = getInterpretationGenerator();

  // 获取需要生成解读的量表
  let query = db
    .select({
      id: ecoaScaleTable.id,
      name: ecoaScaleTable.name,
      nameEn: ecoaScaleTable.nameEn,
      acronym: ecoaScaleTable.acronym,
      author: ecoaScaleTable.author,
      copyrightHolder: ecoaScaleTable.copyrightHolder,
      itemsCount: ecoaScaleTable.itemsCount,
      administrationTime: ecoaScaleTable.administrationTime,
      targetPopulation: ecoaScaleTable.targetPopulation,
      assessmentDomains: ecoaScaleTable.assessmentDomains,
      abstract: ecoaScaleTable.abstract,
      // Check if interpretation exists
      hasInterpretation: sql<number>`
        CASE WHEN EXISTS (
          SELECT 1 FROM ${scaleInterpretationTable}
          WHERE ${scaleInterpretationTable.scaleId} = ${ecoaScaleTable.id}
          AND ${scaleInterpretationTable.language} = ${language}
        ) THEN 1 ELSE 0 END
      `.as('has_interpretation'),
    })
    .from(ecoaScaleTable);

  // 筛选条件
  if (scaleId) {
    query = query.where(eq(ecoaScaleTable.id, scaleId)) as typeof query;
  } else if (!force) {
    // 只生成没有解读的量表
    query = query.where(sql`
      NOT EXISTS (
        SELECT 1 FROM ${scaleInterpretationTable}
        WHERE ${scaleInterpretationTable.scaleId} = ${ecoaScaleTable.id}
        AND ${scaleInterpretationTable.language} = ${language}
      )
    `) as typeof query;
  }

  // 分页
  query = query.limit(limit).offset(offset) as typeof query;

  const scales = await query;

  if (scales.length === 0) {
    console.log('✓ 没有需要生成解读的量表');
    return;
  }

  console.log(`找到 ${scales.length} 个需要生成解读的量表:\n`);
  scales.forEach((scale, index) => {
    const status = scale.hasInterpretation ? '✓ 已有' : '○ 无';
    console.log(`${index + 1}. ${status} ${scale.name} (${scale.acronym})`);
  });
  console.log('');

  if (dryRun) {
    console.log('ℹ️  预览模式，不会实际生成内容');
    return;
  }

  // 确认继续
  console.log('⏳ 开始生成...\n');

  const results = {
    success: 0,
    failed: 0,
    errors: [] as { scale: string; error: string }[],
  };

  for (let i = 0; i < scales.length; i++) {
    const scale = scales[i];
    const progress = `[${i + 1}/${scales.length}]`;

    console.log(`${progress} 正在生成: ${scale.name} (${scale.acronym})...`);

    try {
      // 准备量表数据
      const scaleData: ScaleDataForInterpretation = {
        id: scale.id,
        name: scale.name,
        nameEn: scale.nameEn,
        acronym: scale.acronym,
        author: scale.author || undefined,
        copyrightHolder: scale.copyrightHolder || undefined,
        itemsCount: scale.itemsCount || undefined,
        administrationTime: scale.administrationTime || undefined,
        targetPopulation: scale.targetPopulation as string[] | undefined,
        assessmentDomains: scale.assessmentDomains as string[] | undefined,
        abstract: scale.abstract || undefined,
      };

      // 生成解读
      const result = await generator.generate(scaleData, { language });

      if (!result.success || !result.content) {
        throw new Error(result.error || 'Generation failed');
      }

      // 检查是否已存在
      const existing = await db
        .select()
        .from(scaleInterpretationTable)
        .where(eq(scaleInterpretationTable.scaleId, scale.id))
        .where(eq(scaleInterpretationTable.language, language))
        .limit(1);

      if (existing.length > 0 && !force) {
        console.log(`  ⏭️  跳过（已存在）`);
        continue;
      }

      // 保存到数据库
      if (existing.length > 0) {
        // 更新现有记录
        const oldVersion = existing[0].version;
        
        await db
          .update(scaleInterpretationTable)
          .set({
            overview: result.content.overview,
            structure: result.content.structure,
            psychometricProperties: result.content.psychometricProperties,
            interpretation: result.content.interpretation,
            usageGuidelines: result.content.usageGuidelines,
            clinicalApplications: result.content.clinicalApplications,
            rawContent: result.rawContent,
            aiModel: result.metadata?.model,
            aiTokensUsed: result.metadata?.tokensUsed,
            aiGeneratedAt: new Date(),
            version: oldVersion + 1,
            status: 'draft',
            needsVerification: 1,
            updatedAt: new Date(),
          })
          .where(eq(scaleInterpretationTable.id, existing[0].id));

        // 记录历史
        await db.insert(interpretationHistoryTable).values({
          interpretationId: existing[0].id,
          version: oldVersion + 1,
          changes: JSON.stringify({
            type: 'regenerate',
            reason: 'Batch regeneration',
          }),
          changeType: 'update',
          changeSummary: `AI重新生成（${result.metadata?.model}）`,
          changedBy: 'system',
        });

        console.log(`  ✓ 更新成功 (v${oldVersion} → v${oldVersion + 1})`);
      } else {
        // 插入新记录
        await db.insert(scaleInterpretationTable).values({
          scaleId: scale.id,
          overview: result.content.overview,
          structure: result.content.structure,
          psychometricProperties: result.content.psychometricProperties,
          interpretation: result.content.interpretation,
          usageGuidelines: result.content.usageGuidelines,
          clinicalApplications: result.content.clinicalApplications,
          rawContent: result.rawContent,
          generationMethod: 'ai',
          status: 'draft',
          language,
          aiModel: result.metadata?.model,
          aiTokensUsed: result.metadata?.tokensUsed,
          aiGeneratedAt: new Date(),
          aiConfidence: 0.7, // 默认置信度
          needsVerification: 1,
          version: 1,
        });

        console.log(`  ✓ 生成成功 (${result.metadata?.tokensUsed} tokens, ${result.metadata?.duration}ms)`);
      }

      results.success++;

      // 避免 API 限流
      if (i < scales.length - 1) {
        const delay = 2000; // 2秒延迟
        console.log(`  ⏱️  等待 ${delay}ms...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`  ✗ 生成失败: ${errorMessage}\n`);
      results.failed++;
      results.errors.push({
        scale: `${scale.name} (${scale.acronym})`,
        error: errorMessage,
      });
    }
  }

  // 输出统计
  console.log('\n' + '='.repeat(60));
  console.log('📊 生成统计\n');
  console.log(`成功: ${results.success}`);
  console.log(`失败: ${results.failed}`);
  console.log(`总计: ${scales.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n失败列表:');
    results.errors.forEach(({ scale, error }) => {
      console.log(`  ✗ ${scale}: ${error}`);
    });
  }
  
  console.log('='.repeat(60));
  console.log('');
}

// 解析命令行参数
function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--limit':
        options.limit = parseInt(args[++i]);
        break;
      case '--offset':
        options.offset = parseInt(args[++i]);
        break;
      case '--scale-id':
        options.scaleId = args[++i];
        break;
      case '--force':
        options.force = true;
        break;
      case '--language':
        options.language = args[++i] as 'zh' | 'en';
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        console.log(`
使用方法:
  pnpm tsx scripts/interpretation/generate-batch.ts [options]

选项:
  --limit <number>    限制生成数量（默认: 10）
  --offset <number>   跳过前N个（默认: 0）
  --scale-id <id>     只生成指定量表的解读
  --force             强制重新生成已有解读
  --language <zh|en>  生成语言（默认: zh）
  --dry-run           预览但不实际生成
  --help, -h          显示此帮助信息

示例:
  # 生成前10个量表的解读
  pnpm tsx scripts/interpretation/generate-batch.ts

  # 生成所有量表的解读（分批）
  pnpm tsx scripts/interpretation/generate-batch.ts --limit 50

  # 生成指定量表的解读
  pnpm tsx scripts/interpretation/generate-batch.ts --scale-id scale_xxx

  # 强制重新生成
  pnpm tsx scripts/interpretation/generate-batch.ts --force --limit 5

  # 预览模式
  pnpm tsx scripts/interpretation/generate-batch.ts --dry-run
        `);
        process.exit(0);
    }
  }

  return options;
}

// 运行
const options = parseArgs();
generateBatch(options)
  .then(() => {
    console.log('✓ 完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ 错误:', error);
    process.exit(1);
  });
