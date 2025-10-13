import Anthropic from '@anthropic-ai/sdk';
import type { 
  ScaleDataForInterpretation, 
  InterpretationContent,
  GenerationConfig,
  GenerationResult 
} from '@/types/interpretation';

/**
 * AI 解读生成器
 */
export class InterpretationGenerator {
  private anthropic: Anthropic;
  private defaultModel = 'claude-sonnet-4-5-20250929';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    const config: { apiKey: string; baseURL?: string } = { apiKey };
    
    if (process.env.ANTHROPIC_BASE_URL) {
      config.baseURL = process.env.ANTHROPIC_BASE_URL;
    }

    this.anthropic = new Anthropic(config);
  }

  /**
   * 生成提示词
   */
  private buildPrompt(scale: ScaleDataForInterpretation, language: 'zh' | 'en' = 'zh'): string {
    if (language === 'zh') {
      return this.buildChinesePrompt(scale);
    }
    return this.buildEnglishPrompt(scale);
  }

  /**
   * 构建中文提示词
   */
  private buildChinesePrompt(scale: ScaleDataForInterpretation): string {
    const {
      name,
      nameEn,
      acronym,
      author,
      copyrightHolder,
      itemsCount,
      administrationTime,
      targetPopulation = [],
      assessmentDomains = [],
      abstract,
      yearPublished,
    } = scale;

    return `你是一位专业的临床心理学家和心理测量学专家，拥有丰富的量表应用和解释经验。请为以下心理/医学量表生成专业、准确、实用的解读内容。

# 量表基本信息

- **中文名称**: ${name}
- **英文名称**: ${nameEn}
- **缩写**: ${acronym}
${author ? `- **作者**: ${author}` : ''}
${copyrightHolder ? `- **版权持有者**: ${copyrightHolder}` : ''}
${itemsCount ? `- **题目数量**: ${itemsCount} 题` : ''}
${administrationTime ? `- **施测时间**: ${administrationTime} 分钟` : ''}
${yearPublished ? `- **发布年份**: ${yearPublished}` : ''}
${targetPopulation.length > 0 ? `- **适用人群**: ${targetPopulation.join('、')}` : ''}
${assessmentDomains.length > 0 ? `- **评估领域**: ${assessmentDomains.join('、')}` : ''}
${abstract ? `- **简介**: ${abstract}` : ''}

---

请生成以下内容。每个部分使用指定的 Markdown 标题格式，内容要专业、准确、实用。

## 1. 量表概述

包含以下要点：
- 量表的基本介绍（150-200字）
- 发展历史和背景
- 主要应用场景和目的
- 在临床/研究中的重要性

要求：语言简洁专业，突出量表的核心价值和独特性。

## 2. 量表结构

详细说明：
- 量表的维度/因子结构（如果是多维量表）
- 题目类型（如 Likert 量表、是非题等）
- 计分方法和分数范围
- 各维度的含义和评估内容

要求：提供清晰的结构说明，便于理解量表的组成。

## 3. 心理测量学特性

提供以下信息（基于该量表的常见特性，如果不确定请标注"需要查阅原始文献确认"）：

### 信度
- 内部一致性（Cronbach's α 系数）
- 重测信度
- 分半信度
- 其他相关信度指标

### 效度
- 内容效度
- 结构效度（因子分析结果）
- 效标效度（与其他量表的相关）
- 其他相关效度证据

### 常模数据
- 是否有常模数据
- 常模人群特征
- 参考值范围

要求：提供具体的统计数据（如果有），否则说明典型范围。对不确定的信息明确标注。

## 4. 结果解释

详细说明：
- 总分和各维度分数的含义
- 分数范围及其临床意义
- 切分点（cut-off scores）标准（如有）
- 严重程度分级（正常/轻度/中度/重度等）
- 结果解释的注意事项

要求：提供清晰的分数解释指南，包括具体的分数范围和对应的临床意义。

## 5. 使用指南

### 适用场景
- 最适合使用的情境
- 典型应用领域

### 施测注意事项
- 施测前的准备
- 施测过程中的要点
- 施测环境要求

### 不适用情况
- 哪些情况下不适合使用此量表
- 使用的局限性

### 常见问题
- 使用中的常见问题和解决方案
- 特殊人群使用注意事项

要求：提供实用的操作指南，帮助使用者正确应用量表。

## 6. 临床应用建议

### 典型应用场景
- 详细的临床应用实例
- 在不同场景下的应用要点

### 与其他量表的关系
- 与相似量表的区别和优势
- 可以配合使用的其他评估工具

### 局限性和补充建议
- 量表的局限性
- 如何弥补这些局限
- 综合评估的建议

### 最佳实践
- 临床专家的使用建议
- 提高评估准确性的技巧

要求：提供实用的临床应用指导，帮助专业人士更好地使用量表。

---

**重要要求**：

1. **专业性**: 使用专业术语，但保持可读性
2. **准确性**: 基于循证医学和心理测量学标准，不确定的信息要明确标注
3. **实用性**: 提供具体、可操作的指导
4. **结构清晰**: 严格按照上述格式组织内容
5. **完整性**: 每个部分都要有充实的内容，不要过于简略
6. **引用**: 如果提到具体研究或数据，建议查阅原始文献（但不强制提供引用）
7. **标注不确定性**: 对于不确定或需要验证的信息，使用"需要查阅原始文献确认"或类似表述

请现在生成完整的解读内容。`;
  }

  /**
   * 构建英文提示词
   */
  private buildEnglishPrompt(scale: ScaleDataForInterpretation): string {
    const {
      name,
      nameEn,
      acronym,
      author,
      itemsCount,
      administrationTime,
      targetPopulation = [],
      assessmentDomains = [],
      abstract,
    } = scale;

    return `You are a professional clinical psychologist and psychometric expert with extensive experience in scale application and interpretation. Please generate professional, accurate, and practical interpretation content for the following psychological/medical scale.

# Scale Information

- **Chinese Name**: ${name}
- **English Name**: ${nameEn}
- **Acronym**: ${acronym}
${author ? `- **Author**: ${author}` : ''}
${itemsCount ? `- **Number of Items**: ${itemsCount}` : ''}
${administrationTime ? `- **Administration Time**: ${administrationTime} minutes` : ''}
${targetPopulation.length > 0 ? `- **Target Population**: ${targetPopulation.join(', ')}` : ''}
${assessmentDomains.length > 0 ? `- **Assessment Domains**: ${assessmentDomains.join(', ')}` : ''}
${abstract ? `- **Description**: ${abstract}` : ''}

Please generate comprehensive interpretation content following the structure below...

## 1. Overview
## 2. Structure
## 3. Psychometric Properties
## 4. Interpretation Guidelines
## 5. Usage Guidelines
## 6. Clinical Applications

[Same detailed requirements as Chinese version]`;
  }

  /**
   * 解析 AI 生成的内容
   */
  private parseInterpretation(text: string): InterpretationContent {
    const sections: InterpretationContent = {
      overview: '',
      structure: '',
      psychometricProperties: '',
      interpretation: '',
      usageGuidelines: '',
      clinicalApplications: '',
    };

    // 提取各个部分的内容
    sections.overview = this.extractSection(text, '量表概述', '量表结构') || 
                       this.extractSection(text, 'Overview', 'Structure');
    
    sections.structure = this.extractSection(text, '量表结构', '心理测量学特性') || 
                        this.extractSection(text, 'Structure', 'Psychometric Properties');
    
    sections.psychometricProperties = this.extractSection(text, '心理测量学特性', '结果解释') || 
                                     this.extractSection(text, 'Psychometric Properties', 'Interpretation');
    
    sections.interpretation = this.extractSection(text, '结果解释', '使用指南') || 
                             this.extractSection(text, 'Interpretation', 'Usage Guidelines');
    
    sections.usageGuidelines = this.extractSection(text, '使用指南', '临床应用') || 
                              this.extractSection(text, 'Usage Guidelines', 'Clinical Applications');
    
    sections.clinicalApplications = this.extractSection(text, '临床应用', null) || 
                                   this.extractSection(text, 'Clinical Applications', null);

    return sections;
  }

  /**
   * 提取特定部分的内容
   */
  private extractSection(text: string, startMarker: string, endMarker: string | null): string {
    // 匹配类似 "## 1. 量表概述" 或 "## 量表概述" 的标题
    const startRegex = new RegExp(`##\\s*\\d*\\.?\\s*${startMarker}`, 'i');
    const startMatch = text.match(startRegex);
    
    if (!startMatch || startMatch.index === undefined) {
      return '';
    }
    
    const startIndex = startMatch.index + startMatch[0].length;
    
    if (!endMarker) {
      return text.substring(startIndex).trim();
    }
    
    const endRegex = new RegExp(`##\\s*\\d*\\.?\\s*${endMarker}`, 'i');
    const remainingText = text.substring(startIndex);
    const endMatch = remainingText.match(endRegex);
    
    if (!endMatch || endMatch.index === undefined) {
      return remainingText.trim();
    }
    
    return remainingText.substring(0, endMatch.index).trim();
  }

  /**
   * 生成量表解读
   */
  async generate(
    scale: ScaleDataForInterpretation,
    config: GenerationConfig = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      const {
        model = this.defaultModel,
        temperature = 0.3,
        maxTokens = 4000,
        language = 'zh',
      } = config;

      const prompt = this.buildPrompt(scale, language);

      console.log(`Generating interpretation for ${scale.name} using ${model}...`);

      const message = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;

      if (message.content[0].type !== 'text') {
        throw new Error('Unexpected response type from AI');
      }

      const rawContent = message.content[0].text;
      const content = this.parseInterpretation(rawContent);

      console.log(`✓ Generated interpretation in ${duration}ms`);

      return {
        success: true,
        content,
        rawContent,
        metadata: {
          model,
          tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`✗ Failed to generate interpretation:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        metadata: {
          model: config.model || this.defaultModel,
          tokensUsed: 0,
          duration,
        },
      };
    }
  }

  /**
   * 批量生成（带限流）
   */
  async generateBatch(
    scales: ScaleDataForInterpretation[],
    config: GenerationConfig = {},
    options: {
      delayMs?: number;
      onProgress?: (current: number, total: number, scale: ScaleDataForInterpretation) => void;
      onError?: (scale: ScaleDataForInterpretation, error: string) => void;
    } = {}
  ): Promise<Map<string, GenerationResult>> {
    const { delayMs = 2000, onProgress, onError } = options;
    const results = new Map<string, GenerationResult>();

    for (let i = 0; i < scales.length; i++) {
      const scale = scales[i];
      
      if (onProgress) {
        onProgress(i + 1, scales.length, scale);
      }

      const result = await this.generate(scale, config);
      results.set(scale.id, result);

      if (!result.success && onError) {
        onError(scale, result.error || 'Unknown error');
      }

      // 避免 API 限流
      if (i < scales.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}

// 单例实例
let generatorInstance: InterpretationGenerator | null = null;

/**
 * 获取生成器实例
 */
export function getInterpretationGenerator(): InterpretationGenerator {
  if (!generatorInstance) {
    generatorInstance = new InterpretationGenerator();
  }
  return generatorInstance;
}
