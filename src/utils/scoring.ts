/**
 * Auto-scoring system for eCOA scale assessments
 * Calculates scores based on user responses and scale configuration
 */

import type { EcoaScale, EcoaItem, ScaleResponse } from '@/db/schema';

export interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  percentage: number;
  itemCount: number;
}

export interface ScoringResult {
  totalScore: number;
  maxScore: number;
  completionRate: number;
  dimensionScores: Record<string, DimensionScore>;
  scoringMethod: string;
  interpretation?: string;
  severity?: string;
  recommendations?: string[];
}

export interface ScoringOptions {
  scoringMethod?: 'sum' | 'average' | 'weighted' | 'custom';
  weights?: Record<string, number>; // Item or dimension weights
  reversedItems?: string[]; // Items that need reverse scoring
  customCalculator?: (responses: ScaleResponse[], items: EcoaItem[]) => number;
}

/**
 * Main scoring function
 */
export async function calculateScores(
  scale: EcoaScale,
  items: EcoaItem[],
  responses: ScaleResponse[],
  options: ScoringOptions = {}
): Promise<ScoringResult> {
  const {
    scoringMethod = getScoringMethodFromScale(scale),
    weights = {},
    reversedItems = [],
  } = options;

  // Calculate completion rate
  const completionRate = (responses.length / items.length) * 100;

  // Group responses by dimension
  const responsesByDimension = groupResponsesByDimension(responses, items);

  // Calculate dimension scores
  const dimensionScores: Record<string, DimensionScore> = {};
  let totalScore = 0;
  let maxScore = 0;

  for (const [dimension, dimItems] of Object.entries(responsesByDimension)) {
    const dimResponses = responses.filter(r =>
      dimItems.some(item => item.id === r.itemId)
    );

    const dimScore = calculateDimensionScore(
      dimItems,
      dimResponses,
      scoringMethod,
      weights,
      reversedItems
    );

    dimensionScores[dimension] = dimScore;
    totalScore += dimScore.score;
    maxScore += dimScore.maxScore;
  }

  // Get interpretation and recommendations
  const interpretation = getInterpretation(totalScore, maxScore, scale);
  const severity = getSeverityLevel(totalScore, maxScore, scale);
  const recommendations = getRecommendations(totalScore, maxScore, scale, dimensionScores);

  return {
    totalScore,
    maxScore,
    completionRate,
    dimensionScores,
    scoringMethod,
    interpretation,
    severity,
    recommendations,
  };
}

/**
 * Calculate score for a single dimension
 */
function calculateDimensionScore(
  items: EcoaItem[],
  responses: ScaleResponse[],
  scoringMethod: string,
  weights: Record<string, number>,
  reversedItems: string[]
): DimensionScore {
  let score = 0;
  let maxScore = 0;

  for (const item of items) {
    const response = responses.find(r => r.itemId === item.id);

    if (!response) continue;

    // Get response value
    let value = response.responseValue || 0;

    // Apply reverse scoring if needed
    if (reversedItems.includes(item.id)) {
      const maxValue = getMaxValueForItem(item);
      value = maxValue - value;
    }

    // Apply weight if specified
    const weight = weights[item.id] || 1;
    score += value * weight;

    // Calculate max possible score for this item
    maxScore += getMaxValueForItem(item) * weight;
  }

  // Apply scoring method
  if (scoringMethod === 'average' && items.length > 0) {
    score = score / items.length;
    maxScore = maxScore / items.length;
  }

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return {
    dimension: items[0]?.dimension || 'total',
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    maxScore: Math.round(maxScore * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    itemCount: items.length,
  };
}

/**
 * Get scoring method from scale configuration
 */
function getScoringMethodFromScale(scale: EcoaScale): string {
  if (scale.scoringMethod) {
    if (scale.scoringMethod.toLowerCase().includes('sum')) return 'sum';
    if (scale.scoringMethod.toLowerCase().includes('average')) return 'average';
    if (scale.scoringMethod.toLowerCase().includes('weighted')) return 'weighted';
  }
  return 'sum'; // Default
}

/**
 * Group responses by dimension
 */
function groupResponsesByDimension(
  responses: ScaleResponse[],
  items: EcoaItem[]
): Record<string, EcoaItem[]> {
  const grouped: Record<string, EcoaItem[]> = {};

  for (const item of items) {
    const dimension = item.dimension || 'total';

    if (!grouped[dimension]) {
      grouped[dimension] = [];
    }

    grouped[dimension].push(item);
  }

  return grouped;
}

/**
 * Get maximum possible value for an item
 */
function getMaxValueForItem(item: EcoaItem): number {
  // If response options are defined, use the highest value
  if (item.responseOptions && Array.isArray(item.responseOptions)) {
    // For likert scales, the max is typically the length - 1 (0-based) or just length
    return item.responseOptions.length - 1;
  }

  // Parse from scoring info if available
  if (item.scoringInfo) {
    const match = item.scoringInfo.match(/max[:\s]*(\d+)/i);
    if (match) {
      return Number.parseInt(match[1], 10);
    }
  }

  // Default maximum value
  return 5; // Assuming 5-point likert scale by default
}

/**
 * Get interpretation based on score
 */
function getInterpretation(
  totalScore: number,
  maxScore: number,
  scale: EcoaScale
): string {
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  // Check if scale has custom cutoff scores in psychometric properties
  if (scale.psychometricProperties?.cutoffScores) {
    const cutoffs = scale.psychometricProperties.cutoffScores;

    for (const cutoff of Object.keys(cutoffs).sort((a, b) => Number.parseFloat(b) - Number.parseFloat(a))) {
      if (totalScore >= Number.parseFloat(cutoff)) {
        return cutoffs[cutoff];
      }
    }
  }

  // Default interpretations based on percentage
  if (percentage >= 80) return '重度';
  if (percentage >= 60) return '中度';
  if (percentage >= 40) return '轻度';
  if (percentage >= 20) return '轻微';
  return '正常范围';
}

/**
 * Get severity level
 */
function getSeverityLevel(
  totalScore: number,
  maxScore: number,
  scale: EcoaScale
): string {
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  if (percentage >= 80) return 'severe';
  if (percentage >= 60) return 'moderate';
  if (percentage >= 40) return 'mild';
  if (percentage >= 20) return 'minimal';
  return 'normal';
}

/**
 * Get recommendations based on scores
 */
function getRecommendations(
  totalScore: number,
  maxScore: number,
  scale: EcoaScale,
  dimensionScores: Record<string, DimensionScore>
): string[] {
  const recommendations: string[] = [];
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  // Overall recommendations
  if (percentage >= 80) {
    recommendations.push('建议寻求专业医疗帮助');
    recommendations.push('可能需要药物治疗或心理干预');
  } else if (percentage >= 60) {
    recommendations.push('建议咨询专业医师');
    recommendations.push('考虑开始治疗或调整现有治疗方案');
  } else if (percentage >= 40) {
    recommendations.push('建议定期监测');
    recommendations.push('考虑心理咨询或生活方式调整');
  } else if (percentage >= 20) {
    recommendations.push('建议保持关注');
    recommendations.push('必要时进行复评');
  } else {
    recommendations.push('继续保持良好状态');
    recommendations.push('定期进行健康评估');
  }

  // Dimension-specific recommendations
  for (const [dimension, score] of Object.entries(dimensionScores)) {
    if (score.percentage >= 70) {
      recommendations.push(`${dimension}维度得分较高，建议重点关注`);
    }
  }

  return recommendations;
}

/**
 * Validate scoring calculation
 */
export function validateScoring(
  scale: EcoaScale,
  items: EcoaItem[],
  responses: ScaleResponse[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if all responses belong to valid items
  for (const response of responses) {
    const item = items.find(i => i.id === response.itemId);
    if (!item) {
      errors.push(`Response contains invalid itemId: ${response.itemId}`);
    }
  }

  // Check if responses match scale
  const scaleItemIds = items.map(i => i.id);
  const responseItemIds = responses.map(r => r.itemId);
  const invalidResponses = responseItemIds.filter(id => !scaleItemIds.includes(id));

  if (invalidResponses.length > 0) {
    errors.push(`Responses contain items not belonging to this scale: ${invalidResponses.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate percentile rank (if norm data is available)
 */
export function calculatePercentileRank(
  score: number,
  normData: number[]
): number {
  if (!normData || normData.length === 0) return 0;

  const belowScore = normData.filter(n => n < score).length;
  return (belowScore / normData.length) * 100;
}
