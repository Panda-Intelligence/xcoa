/**
 * 量表解读内容结构
 */
export interface InterpretationContent {
  overview: string;              // 量表概述
  structure: string;             // 量表结构
  psychometricProperties: string; // 心理测量学特性
  interpretation: string;        // 结果解释
  usageGuidelines: string;       // 使用指南
  clinicalApplications: string;  // 临床应用
}

/**
 * 量表数据（用于生成解读）
 */
export interface ScaleDataForInterpretation {
  id: string;
  name: string;
  nameEn: string;
  acronym: string;
  author?: string;
  copyrightHolder?: string;
  itemsCount?: number;
  administrationTime?: number;
  targetPopulation?: string[];
  assessmentDomains?: string[];
  abstract?: string;
  yearPublished?: number;
}

/**
 * AI 生成配置
 */
export interface GenerationConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  language?: 'zh' | 'en';
}

/**
 * 生成结果
 */
export interface GenerationResult {
  success: boolean;
  content?: InterpretationContent;
  rawContent?: string;
  error?: string;
  metadata?: {
    model: string;
    tokensUsed: number;
    duration: number;
  };
}
