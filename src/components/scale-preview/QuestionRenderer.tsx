'use client';

import React from 'react';
import { RadioQuestionRenderer } from './question-types/RadioQuestionRenderer';
import { CheckboxQuestionRenderer } from './question-types/CheckboxQuestionRenderer';
import { OpenQuestionRenderer } from './question-types/OpenQuestionRenderer';
import { DateQuestionRenderer } from './question-types/DateQuestionRenderer';
import { DrawingQuestionRenderer } from './question-types/DrawingQuestionRenderer';
import type { EcoaItem } from '@/db/schema';

interface QuestionRendererProps {
  item: EcoaItem;
  itemIndex: number;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

/**
 * 题目类型映射和渲染器
 * 根据题目的 responseType 字段决定使用哪种渲染器
 */
export function QuestionRenderer({ 
  item, 
  itemIndex, 
  value, 
  onChange, 
  disabled = false,
  deviceMode = 'desktop'
}: QuestionRendererProps) {
  
  // 根据 responseType 和 responseOptions 判断题目类型
  const getQuestionType = (item: EcoaItem) => {
    const { responseType, responseOptions } = item;
    
    // 如果没有选项，判断为开放性题目
    if (!responseOptions || responseOptions.length === 0) {
      return 'open';
    }
    
    switch (responseType) {
      case 'likert':
      case 'boolean':
      case 'single_choice':
        return 'radio';
      case 'multiple_choice':
      case 'checkbox':
        return 'checkbox';
      case 'text':
      case 'textarea':
        return 'open';
      case 'date':
      case 'datetime':
        return 'date';
      case 'drawing':
      case 'sketch':
        return 'drawing';
      default:
        // 默认情况：根据选项数量判断
        if (responseOptions && responseOptions.length > 0) {
          // 如果题目文本包含多选相关关键词，判断为多选
          const questionText = item.question.toLowerCase();
          if (questionText.includes('多选') || questionText.includes('可选择多项') || 
              questionText.includes('可以选择多个') || questionText.includes('选择所有')) {
            return 'checkbox';
          }
          return 'radio';
        }
        return 'open';
    }
  };

  const questionType = getQuestionType(item);

  // 渲染对应的题目组件
  switch (questionType) {
    case 'radio':
      return (
        <RadioQuestionRenderer
          item={item}
          itemIndex={itemIndex}
          value={value}
          onChange={onChange}
          disabled={disabled}
          deviceMode={deviceMode}
        />
      );
    
    case 'checkbox':
      return (
        <CheckboxQuestionRenderer
          item={item}
          itemIndex={itemIndex}
          value={value}
          onChange={onChange}
          disabled={disabled}
          deviceMode={deviceMode}
        />
      );
    
    case 'open':
      return (
        <OpenQuestionRenderer
          item={item}
          itemIndex={itemIndex}
          value={value}
          onChange={onChange}
          disabled={disabled}
          deviceMode={deviceMode}
        />
      );
    
    case 'date':
      return (
        <DateQuestionRenderer
          item={item}
          itemIndex={itemIndex}
          value={value}
          onChange={onChange}
          disabled={disabled}
          deviceMode={deviceMode}
        />
      );
    
    case 'drawing':
      return (
        <DrawingQuestionRenderer
          item={item}
          itemIndex={itemIndex}
          value={value}
          onChange={onChange}
          disabled={disabled}
          deviceMode={deviceMode}
        />
      );
    
    default:
      // 兜底方案：使用单选渲染器
      return (
        <RadioQuestionRenderer
          item={item}
          itemIndex={itemIndex}
          value={value}
          onChange={onChange}
          disabled={disabled}
          deviceMode={deviceMode}
        />
      );
  }
}