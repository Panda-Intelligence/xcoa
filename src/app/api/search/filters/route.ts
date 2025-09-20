import { NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaCategoryTable, ecoaScaleTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDB();
    // 获取所有分类及其量表数量
    const categories = await db
      .select({
        id: ecoaCategoryTable.id,
        name: ecoaCategoryTable.name,
        nameEn: ecoaCategoryTable.nameEn,
        description: ecoaCategoryTable.description,
        descriptionEn: ecoaCategoryTable.descriptionEn,
        scaleCount: sql`COUNT(${ecoaScaleTable.id})`.mapWith(Number),
      })
      .from(ecoaCategoryTable)
      .leftJoin(
        ecoaScaleTable, 
        eq(ecoaCategoryTable.id, ecoaScaleTable.categoryId)
      )
      .groupBy(ecoaCategoryTable.id)
      .orderBy(ecoaCategoryTable.sortOrder);

    // 获取验证状态选项
    const validationStatuses = await db
      .selectDistinct({
        value: ecoaScaleTable.validationStatus,
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(ecoaScaleTable)
      .groupBy(ecoaScaleTable.validationStatus)
      .orderBy(ecoaScaleTable.validationStatus);

    // 获取语言选项
    const languages = await db
      .select({
        languages: ecoaScaleTable.languages,
      })
      .from(ecoaScaleTable)
      .where(sql`${ecoaScaleTable.languages} IS NOT NULL`);

    // 处理语言数据
    const languageSet = new Set<string>();
    languages.forEach(row => {
      if (row.languages) {
        try {
          const langArray = JSON.parse(row.languages);
          if (Array.isArray(langArray)) {
            langArray.forEach(lang => languageSet.add(lang));
          }
        } catch (e) {
          // 忽略JSON解析错误
        }
      }
    });

    const languageOptions = Array.from(languageSet).map(lang => ({
      value: lang,
      label: getLanguageLabel(lang),
    })).sort((a, b) => a.label.localeCompare(b.label));

    // 获取题项数量范围
    const itemCountRange = await db
      .select({
        min: sql`MIN(${ecoaScaleTable.itemsCount})`.mapWith(Number),
        max: sql`MAX(${ecoaScaleTable.itemsCount})`.mapWith(Number),
      })
      .from(ecoaScaleTable);

    // 获取管理时间范围
    const timeRange = await db
      .select({
        min: sql`MIN(${ecoaScaleTable.administrationTime})`.mapWith(Number),
        max: sql`MAX(${ecoaScaleTable.administrationTime})`.mapWith(Number),
      })
      .from(ecoaScaleTable)
      .where(sql`${ecoaScaleTable.administrationTime} IS NOT NULL`);

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        nameEn: cat.nameEn,
        description: cat.description,
        descriptionEn: cat.descriptionEn,
        scaleCount: cat.scaleCount,
      })),
      validationStatuses: validationStatuses.map(status => ({
        value: status.value,
        label: getValidationStatusLabel(status.value),
        count: status.count,
      })),
      languages: languageOptions,
      ranges: {
        itemsCount: {
          min: itemCountRange[0]?.min || 0,
          max: itemCountRange[0]?.max || 100,
        },
        administrationTime: {
          min: timeRange[0]?.min || 0,
          max: timeRange[0]?.max || 60,
        },
      },
    });

  } catch (error) {
    console.error('Filters API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getLanguageLabel(langCode: string): string {
  const labels: Record<string, string> = {
    'zh-CN': '中文',
    'en-US': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'ja': '日本語',
    'ko': '한국어',
    'pt': 'Português',
    'ru': 'Русский',
  };
  return labels[langCode] || langCode;
}

function getValidationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'draft': '草稿',
    'validated': '已验证',
    'published': '已发布',
    'deprecated': '已废弃',
  };
  return labels[status] || status;
}