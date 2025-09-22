'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { EcoaItem } from '@/db/schema';

interface CheckboxQuestionRendererProps {
  item: EcoaItem;
  itemIndex: number;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export function CheckboxQuestionRenderer({
  item,
  itemIndex,
  value = [],
  onChange,
  disabled = false,
  deviceMode = 'desktop'
}: CheckboxQuestionRendererProps) {
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

  // 处理选项选择
  const handleOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      // 添加选项
      if (!value.includes(option)) {
        onChange([...value, option]);
      }
    } else {
      // 移除选项
      onChange(value.filter(v => v !== option));
    }
  };

  // 计算总分
  const calculateScore = () => {
    if (!responseOptions) return 0;
    return value.reduce((total, selectedOption) => {
      const optionIndex = responseOptions.indexOf(selectedOption);
      return total + (optionIndex >= 0 ? optionIndex : 0);
    }, 0);
  };

  if (!responseOptions || responseOptions.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <p>该题目没有可选选项</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 多选提示 */}
      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>多选题：可选择多个选项</span>
        </div>
      </div>

      <div className={deviceStyles.spacing}>
        {responseOptions.map((option: string, optionIndex: number) => {
          const isChecked = value.includes(option);
          
          return (
            <div 
              key={`${item.itemNumber}-${optionIndex}`} 
              className={`
                flex items-center space-x-3 
                ${deviceStyles.cardPadding} 
                rounded-lg 
                border border-transparent 
                hover:bg-blue-50 hover:border-blue-200 
                transition-all cursor-pointer
                ${isChecked ? 'bg-blue-50 border-blue-300' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Checkbox
                id={`checkbox-${item.itemNumber}-${optionIndex}`}
                checked={isChecked}
                onCheckedChange={(checked) => 
                  handleOptionChange(option, checked as boolean)
                }
                disabled={disabled}
                className="shrink-0"
              />
              <Label
                htmlFor={`checkbox-${item.itemNumber}-${optionIndex}`}
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
                      ${isChecked ? 'bg-blue-100 text-blue-800' : ''}
                    `}
                  >
                    {optionIndex}分
                  </Badge>
                </div>
              </Label>
            </div>
          );
        })}
      </div>

      {/* 选择状态指示 */}
      {value.length > 0 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-green-700">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>已选择 {value.length} 项</span>
              </span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                总分: {calculateScore()}
              </Badge>
            </div>
            <div className="text-xs text-green-600">
              {value.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* 全选/取消全选按钮 */}
      {!disabled && (
        <div className="flex space-x-2 pt-2 border-t">
          <button
            type="button"
            onClick={() => onChange(responseOptions)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            disabled={value.length === responseOptions.length}
          >
            全选
          </button>
          <span className="text-xs text-gray-400">|</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
            disabled={value.length === 0}
          >
            取消全选
          </button>
        </div>
      )}
    </div>
  );
}