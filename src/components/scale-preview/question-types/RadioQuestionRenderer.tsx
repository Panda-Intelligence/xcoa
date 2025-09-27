'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { EcoaItem } from '@/db/schema';

interface RadioQuestionRendererProps {
  item: EcoaItem;
  itemIndex: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export function RadioQuestionRenderer({
  item,
  itemIndex,
  value,
  onChange,
  disabled = false,
  deviceMode = 'desktop'
}: RadioQuestionRendererProps) {
  const { responseOptions } = item;

  // 设备响应式样式
  const getDeviceStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          fontSize: 'text-sm',
          cardPadding: 'p-3',
          spacing: 'space-y-2'
        };
      case 'tablet':
        return {
          fontSize: 'text-base',
          cardPadding: 'p-4',
          spacing: 'space-y-3'
        };
      default:
        return {
          fontSize: 'text-base',
          cardPadding: 'p-4',
          spacing: 'space-y-3'
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  if (!responseOptions || responseOptions.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <p>该题目没有可选选项</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className={deviceStyles.spacing}
      >
        {responseOptions.map((option: string, optionIndex: number) => (
          <div 
            key={`${item.itemNumber}-${optionIndex}`} 
            className={`
              flex items-center space-x-3 
              ${deviceStyles.cardPadding} 
              rounded-lg 
              border border-transparent 
              hover:bg-blue-50 hover:border-blue-200 
              transition-all cursor-pointer
              ${value === option ? 'bg-blue-50 border-blue-300' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <RadioGroupItem
              value={option}
              id={`radio-${item.itemNumber}-${optionIndex}`}
              disabled={disabled}
              className="shrink-0"
            />
            <Label
              htmlFor={`radio-${item.itemNumber}-${optionIndex}`}
              className={`
                flex-1 cursor-pointer 
                ${deviceStyles.fontSize} 
                leading-relaxed py-2
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1">{option}</span>
                <Badge 
                  variant="outline" 
                  className={`
                    text-xs ml-2 shrink-0
                    ${value === option ? 'bg-blue-100 text-blue-800' : ''}
                  `}
                >
                  {optionIndex}分
                </Badge>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* 选择状态指示 */}
      {value && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>已选择: {value}</span>
          </div>
        </div>
      )}
    </div>
  );
}