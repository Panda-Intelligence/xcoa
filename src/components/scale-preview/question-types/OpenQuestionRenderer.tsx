'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { EcoaItem } from '@/db/schema';

interface OpenQuestionRendererProps {
  item: EcoaItem;
  itemIndex: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export function OpenQuestionRenderer({
  item,
  itemIndex,
  value = '',
  onChange,
  disabled = false,
  deviceMode = 'desktop'
}: OpenQuestionRendererProps) {
  const [isFocused, setIsFocused] = useState(false);

  // 设备响应式样式
  const getDeviceStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          fontSize: 'text-sm',
          padding: 'p-3',
          inputSize: 'text-sm'
        };
      case 'tablet':
        return {
          fontSize: 'text-base',
          padding: 'p-4',
          inputSize: 'text-base'
        };
      default:
        return {
          fontSize: 'text-base',
          padding: 'p-4',
          inputSize: 'text-base'
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  // 判断是否需要使用多行文本框
  const isTextarea = () => {
    const questionText = item.question.toLowerCase();
    return (
      item.responseType === 'textarea' ||
      questionText.includes('详细描述') ||
      questionText.includes('说明') ||
      questionText.includes('解释') ||
      questionText.includes('意见') ||
      questionText.includes('建议') ||
      questionText.includes('感受') ||
      questionText.includes('体验') ||
      questionText.includes('评价')
    );
  };

  // 获取占位符文本
  const getPlaceholder = () => {
    if (isTextarea()) {
      return '请在此输入您的详细回答...';
    }
    
    const questionText = item.question.toLowerCase();
    if (questionText.includes('姓名')) return '请输入姓名';
    if (questionText.includes('年龄')) return '请输入年龄';
    if (questionText.includes('电话') || questionText.includes('手机')) return '请输入电话号码';
    if (questionText.includes('邮箱') || questionText.includes('email')) return '请输入邮箱地址';
    if (questionText.includes('地址')) return '请输入地址';
    if (questionText.includes('数字') || questionText.includes('分数')) return '请输入数字';
    
    return '请输入您的回答';
  };

  // 获取输入类型
  const getInputType = () => {
    const questionText = item.question.toLowerCase();
    if (questionText.includes('邮箱') || questionText.includes('email')) return 'email';
    if (questionText.includes('电话') || questionText.includes('手机')) return 'tel';
    if (questionText.includes('年龄') || questionText.includes('数字') || questionText.includes('分数')) return 'number';
    if (questionText.includes('网址') || questionText.includes('链接')) return 'url';
    return 'text';
  };

  // 验证输入
  const validateInput = (inputValue: string) => {
    const inputType = getInputType();
    
    switch (inputType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);
      case 'tel':
        return /^[\d\s\-\+\(\)]+$/.test(inputValue);
      case 'number':
        return !isNaN(Number(inputValue)) && inputValue.trim() !== '';
      case 'url':
        try {
          new URL(inputValue);
          return true;
        } catch {
          return false;
        }
      default:
        return inputValue.trim().length > 0;
    }
  };

  const isValid = value ? validateInput(value) : true;
  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      {/* 输入类型提示 */}
      <div className="text-sm text-primary bg-primary/10 p-2 rounded border border-blue-200">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-primary/100 rounded-full"></span>
          <span>
            开放性问题：
            {isTextarea() ? '多行文本输入' : getInputType() === 'number' ? '数字输入' : '文本输入'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor={`input-${item.itemNumber}`}
          className={`${deviceStyles.fontSize} font-medium`}
        >
          您的回答
        </Label>
        
        {isTextarea() ? (
          <Textarea
            id={`input-${item.itemNumber}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            disabled={disabled}
            className={`
              ${deviceStyles.inputSize}
              min-h-[120px] resize-y
              ${isFocused ? 'ring-2 ring-blue-500' : ''}
              ${!isValid && value ? 'border-red-300 focus:ring-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            rows={deviceMode === 'mobile' ? 4 : 6}
          />
        ) : (
          <Input
            id={`input-${item.itemNumber}`}
            type={getInputType()}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            disabled={disabled}
            className={`
              ${deviceStyles.inputSize}
              ${isFocused ? 'ring-2 ring-blue-500' : ''}
              ${!isValid && value ? 'border-red-300 focus:ring-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        )}
      </div>

      {/* 输入状态和统计 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-3">
          {value && (
            <>
              <span>{characterCount} 字符</span>
              {isTextarea() && <span>{wordCount} 词</span>}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {value && !isValid && (
            <Badge variant="destructive" className="text-xs">
              格式不正确
            </Badge>
          )}
          {value && isValid && (
            <Badge variant="outline" className="text-xs bg-success/10 text-green-700">
              已填写
            </Badge>
          )}
        </div>
      </div>

      {/* 格式提示 */}
      {getInputType() !== 'text' && (
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          {getInputType() === 'email' && '请输入有效的邮箱地址，如：example@email.com'}
          {getInputType() === 'tel' && '请输入有效的电话号码'}
          {getInputType() === 'number' && '请输入数字'}
          {getInputType() === 'url' && '请输入有效的网址，如：https://example.com'}
        </div>
      )}

      {/* 输入内容预览 */}
      {value && (
        <div className="mt-3 p-3 bg-success/10 border border-green-200 rounded">
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-success/100 rounded-full mt-1.5 shrink-0"></span>
            <div className="flex-1">
              <div className="text-sm text-green-700 font-medium mb-1">您的回答：</div>
              <div className={`${deviceStyles.fontSize} text-success ${isTextarea() ? 'whitespace-pre-wrap' : ''}`}>
                {value}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}