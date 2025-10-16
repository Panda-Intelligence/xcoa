#!/usr/bin/env tsx
/**
 * 量表数据质量检查脚本
 *
 * 功能：
 * - 检查量表数据完整性
 * - 统计items覆盖率
 * - 检查版权信息完整度
 * - 生成质量报告
 *
 * 运行：pnpm tsx scripts/utils/quality-check.ts
 */

import { getDB } from '@/db';
import { ecoaScaleTable, ecoaItemTable } from '@/db/schemas/scale';
import { sql, isNull, isNotNull } from 'drizzle-orm';

interface QualityMetrics {
  // 量表统计
  totalScales: number;
  scalesWithItems: number;
  scalesWithoutItems: number;
  scalesWithCopyright: number;
  scalesWithoutCopyright: number;

  // Items统计
  totalItems: number;
  avgItemsPerScale: number;
  minItemsPerScale: number;
  maxItemsPerScale: number;

  // 版权统计
  scalesWithVerifiedCopyright: number;
  scalesWithLicenseType: number;

  // 状态统计
  draftScales: number;
  validatedScales: number;
  publishedScales: number;

  // 多语言支持
  scalesWithEnglishName: number;
  scalesWithEnglishDescription: number;

  // 详细信息
  missingItemsScales: Array<{
    id: string;
    name: string;
    acronym: string | null;
    itemsCount: number;
  }>;
  missingCopyrightScales: Array<{
    id: string;
    name: string;
    acronym: string | null;
  }>;
}

async function checkDataQuality(): Promise<QualityMetrics> {
  const db = getDB();

  console.log('🔍 Starting data quality check...\n');

  // 1. 量表总数统计
  const totalScalesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaScaleTable);
  const totalScales = totalScalesResult[0]?.count || 0;

  // 2. 有items的量表统计
  const scalesWithItemsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaScaleTable)
    .where(sql`${ecoaScaleTable.itemsCount} > 0`);
  const scalesWithItems = scalesWithItemsResult[0]?.count || 0;

  // 3. Items统计
  const totalItemsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaItemTable);
  const totalItems = totalItemsResult[0]?.count || 0;

  // 4. Items统计详情（平均、最小、最大）
  const itemsStatsResult = await db
    .select({
      avg: sql<number>`AVG(${ecoaScaleTable.itemsCount})`,
      min: sql<number>`MIN(${ecoaScaleTable.itemsCount})`,
      max: sql<number>`MAX(${ecoaScaleTable.itemsCount})`,
    })
    .from(ecoaScaleTable)
    .where(sql`${ecoaScaleTable.itemsCount} > 0`);

  const avgItemsPerScale = Math.round(itemsStatsResult[0]?.avg || 0);
  const minItemsPerScale = itemsStatsResult[0]?.min || 0;
  const maxItemsPerScale = itemsStatsResult[0]?.max || 0;

  // 5. 版权信息统计（暂时禁用，避免模块导入问题）
  const scalesWithCopyright = 0; // TODO: 修复后启用
  const scalesWithVerifiedCopyright = 0; // TODO: 修复后启用
  const scalesWithLicenseType = 0; // TODO: 修复后启用

  /*
  const scalesWithCopyrightResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaScaleTable)
    .where(isNotNull(ecoaScaleTable.copyrightHolderId));
  const scalesWithCopyright = scalesWithCopyrightResult[0]?.count || 0;

  const scalesWithVerifiedCopyrightResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaScaleTable)
    .leftJoin(copyrightHolderTable, eq(ecoaScaleTable.copyrightHolderId, copyrightHolderTable.id))
    .where(and(
      isNotNull(ecoaScaleTable.copyrightHolderId),
      eq(copyrightHolderTable.isVerified, 1)
    ));
  const scalesWithVerifiedCopyright = scalesWithVerifiedCopyrightResult[0]?.count || 0;

  const scalesWithLicenseTypeResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaScaleTable)
    .where(isNotNull(ecoaScaleTable.licenseType));
  const scalesWithLicenseType = scalesWithLicenseTypeResult[0]?.count || 0;
  */

  // 6. 状态统计
  const statusStatsResult = await db
    .select({
      validationStatus: ecoaScaleTable.validationStatus,
      count: sql<number>`count(*)`
    })
    .from(ecoaScaleTable)
    .groupBy(ecoaScaleTable.validationStatus);

  const draftScales = statusStatsResult.find(s => s.validationStatus === 'draft')?.count || 0;
  const validatedScales = statusStatsResult.find(s => s.validationStatus === 'validated')?.count || 0;
  const publishedScales = statusStatsResult.find(s => s.validationStatus === 'published')?.count || 0;

  // 7. 多语言支持统计
  const scalesWithEnglishNameResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaScaleTable)
    .where(isNotNull(ecoaScaleTable.nameEn));
  const scalesWithEnglishName = scalesWithEnglishNameResult[0]?.count || 0;

  const scalesWithEnglishDescResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecoaScaleTable)
    .where(isNotNull(ecoaScaleTable.descriptionEn));
  const scalesWithEnglishDescription = scalesWithEnglishDescResult[0]?.count || 0;

  // 8. 缺少items的量表列表（前10个）
  const missingItemsScales = await db
    .select({
      id: ecoaScaleTable.id,
      name: ecoaScaleTable.name,
      acronym: ecoaScaleTable.acronym,
      itemsCount: ecoaScaleTable.itemsCount,
    })
    .from(ecoaScaleTable)
    .where(sql`${ecoaScaleTable.itemsCount} = 0`)
    .limit(10);

  // 9. 缺少版权信息的量表列表（前10个）
  const missingCopyrightScales = await db
    .select({
      id: ecoaScaleTable.id,
      name: ecoaScaleTable.name,
      acronym: ecoaScaleTable.acronym,
    })
    .from(ecoaScaleTable)
    .where(isNull(ecoaScaleTable.copyrightHolderId))
    .limit(10);

  return {
    totalScales,
    scalesWithItems,
    scalesWithoutItems: totalScales - scalesWithItems,
    scalesWithCopyright,
    scalesWithoutCopyright: totalScales - scalesWithCopyright,
    totalItems,
    avgItemsPerScale,
    minItemsPerScale,
    maxItemsPerScale,
    scalesWithVerifiedCopyright,
    scalesWithLicenseType,
    draftScales,
    validatedScales,
    publishedScales,
    scalesWithEnglishName,
    scalesWithEnglishDescription,
    missingItemsScales,
    missingCopyrightScales,
  };
}

function printReport(metrics: QualityMetrics) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  📊 数据质量报告                           ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. 量表总览
  console.log('📦 量表总览:');
  console.log(`   总量表数: ${metrics.totalScales}`);
  console.log(`   ✅ 有Items: ${metrics.scalesWithItems} (${percentage(metrics.scalesWithItems, metrics.totalScales)})`);
  console.log(`   ⚠️  无Items: ${metrics.scalesWithoutItems} (${percentage(metrics.scalesWithoutItems, metrics.totalScales)})`);
  console.log('');

  // 2. Items详情
  console.log('📝 Items详情:');
  console.log(`   总Items数: ${metrics.totalItems}`);
  console.log(`   平均每个量表: ${metrics.avgItemsPerScale} 个items`);
  console.log(`   最少items: ${metrics.minItemsPerScale}`);
  console.log(`   最多items: ${metrics.maxItemsPerScale}`);
  console.log('');

  // 3. 版权信息
  console.log('©️  版权信息:');
  console.log(`   ✅ 有版权信息: ${metrics.scalesWithCopyright} (${percentage(metrics.scalesWithCopyright, metrics.totalScales)})`);
  console.log(`   ⚠️  无版权信息: ${metrics.scalesWithoutCopyright} (${percentage(metrics.scalesWithoutCopyright, metrics.totalScales)})`);
  console.log(`   🔒 已验证版权: ${metrics.scalesWithVerifiedCopyright} (${percentage(metrics.scalesWithVerifiedCopyright, metrics.totalScales)})`);
  console.log(`   📜 有许可类型: ${metrics.scalesWithLicenseType} (${percentage(metrics.scalesWithLicenseType, metrics.totalScales)})`);
  console.log('');

  // 4. 验证状态
  console.log('📋 验证状态:');
  console.log(`   📝 Draft: ${metrics.draftScales} (${percentage(metrics.draftScales, metrics.totalScales)})`);
  console.log(`   ✔️  Validated: ${metrics.validatedScales} (${percentage(metrics.validatedScales, metrics.totalScales)})`);
  console.log(`   ✅ Published: ${metrics.publishedScales} (${percentage(metrics.publishedScales, metrics.totalScales)})`);
  console.log('');

  // 5. 多语言支持
  console.log('🌐 多语言支持:');
  console.log(`   有英文名称: ${metrics.scalesWithEnglishName} (${percentage(metrics.scalesWithEnglishName, metrics.totalScales)})`);
  console.log(`   有英文描述: ${metrics.scalesWithEnglishDescription} (${percentage(metrics.scalesWithEnglishDescription, metrics.totalScales)})`);
  console.log('');

  // 6. 质量评分
  console.log('⭐ 质量评分:');
  const itemsScore = (metrics.scalesWithItems / metrics.totalScales) * 100;
  const copyrightScore = (metrics.scalesWithCopyright / metrics.totalScales) * 100;
  const publishedScore = (metrics.publishedScales / metrics.totalScales) * 100;
  const multiLangScore = (metrics.scalesWithEnglishName / metrics.totalScales) * 100;
  const overallScore = (itemsScore + copyrightScore + publishedScore + multiLangScore) / 4;

  console.log(`   Items完整度: ${itemsScore.toFixed(1)}%  ${getScoreEmoji(itemsScore)}`);
  console.log(`   版权信息完整度: ${copyrightScore.toFixed(1)}%  ${getScoreEmoji(copyrightScore)}`);
  console.log(`   发布状态: ${publishedScore.toFixed(1)}%  ${getScoreEmoji(publishedScore)}`);
  console.log(`   多语言支持: ${multiLangScore.toFixed(1)}%  ${getScoreEmoji(multiLangScore)}`);
  console.log(`   ─────────────────────────────────`);
  console.log(`   综合评分: ${overallScore.toFixed(1)}%  ${getScoreEmoji(overallScore)}`);
  console.log('');

  // 7. 待改进项
  console.log('⚠️  待改进项:');
  if (metrics.scalesWithoutItems > 0) {
    console.log(`   ⚠️  ${metrics.scalesWithoutItems} 个量表缺少items数据`);
    if (metrics.missingItemsScales.length > 0) {
      console.log('      示例（前10个）:');
      metrics.missingItemsScales.forEach(scale => {
        console.log(`      - ${scale.acronym || scale.id}: ${scale.name}`);
      });
    }
  }

  if (metrics.scalesWithoutCopyright > 0) {
    console.log(`   ⚠️  ${metrics.scalesWithoutCopyright} 个量表缺少版权信息`);
    if (metrics.missingCopyrightScales.length > 0) {
      console.log('      示例（前10个）:');
      metrics.missingCopyrightScales.forEach(scale => {
        console.log(`      - ${scale.acronym || scale.id}: ${scale.name}`);
      });
    }
  }

  if (metrics.draftScales > 0) {
    console.log(`   📝 ${metrics.draftScales} 个量表处于Draft状态，需要审核`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 8. 建议
  console.log('💡 改进建议:');
  if (itemsScore < 50) {
    console.log('   🔴 紧急：Items完整度低于50%，建议立即运行爬虫补充items数据');
  } else if (itemsScore < 80) {
    console.log('   🟡 重要：Items完整度低于80%，建议补充缺失的items数据');
  }

  if (copyrightScore < 70) {
    console.log('   🟡 重要：版权信息不足，建议添加版权方信息');
  }

  if (publishedScore < 90) {
    console.log('   🟡 建议：将验证通过的量表状态改为Published');
  }

  if (multiLangScore < 50) {
    console.log('   🟡 建议：使用AI翻译工具补充英文名称和描述');
  }

  console.log('');
}

function percentage(value: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return '🟢 优秀';
  if (score >= 70) return '🟡 良好';
  if (score >= 50) return '🟠 一般';
  return '🔴 需改进';
}

async function main() {
  try {
    const metrics = await checkDataQuality();
    printReport(metrics);

    // 返回退出码（用于CI/CD）
    const itemsScore = (metrics.scalesWithItems / metrics.totalScales) * 100;
    const copyrightScore = (metrics.scalesWithCopyright / metrics.totalScales) * 100;
    const overallScore = (itemsScore + copyrightScore) / 2;

    if (overallScore < 50) {
      console.log('❌ 质量检查失败：综合评分低于50%\n');
      process.exit(1);
    } else if (overallScore < 80) {
      console.log('⚠️  质量检查通过，但仍有改进空间\n');
      process.exit(0);
    } else {
      console.log('✅ 质量检查通过：数据质量良好\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ 质量检查失败:', error);
    process.exit(1);
  }
}

main();
