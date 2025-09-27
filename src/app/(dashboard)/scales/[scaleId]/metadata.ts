import type { Metadata } from 'next';

// Helper function to generate metadata based on scale data
export function generateScaleMetadata(scale: any): Metadata {
  if (!scale) {
    return {
      title: '量表未找到 - xCOA',
      description: '您查找的eCOA量表不存在或已被删除。'
    };
  }

  return {
    title: `${scale.name} (${scale.acronym}) - xCOA`,
    description: scale.description?.substring(0, 160) + '...' || scale.descriptionEn?.substring(0, 160) + '...',
    keywords: [
      scale.acronym,
      scale.name,
      scale.nameEn,
      '量表',
      'eCOA',
      '评估工具',
      ...JSON.parse(scale.domains || '[]')
    ].filter(Boolean).join(', '),
  };
}