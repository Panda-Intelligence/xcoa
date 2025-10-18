'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import type { EcoaItem } from '@/db/schema';
import { useLanguage } from '@/hooks/useLanguage';

interface DateQuestionRendererProps {
  item: EcoaItem;
  itemIndex: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export function DateQuestionRenderer({
  item,
  itemIndex,
  value = '',
  onChange,
  disabled = false,
  deviceMode = 'desktop'
}: DateQuestionRendererProps) {
  const { t } = useLanguage();
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

  // 判断是否需要时间选择
  const needsTime = () => {
    const questionText = item.question.toLowerCase();
    return (
      item.responseType === 'datetime' ||
      questionText.includes('时间') ||
      questionText.includes('几点') ||
      questionText.includes('什么时候') ||
      questionText.includes('具体时刻')
    );
  };

  // 获取输入类型
  const getInputType = () => {
    return needsTime() ? 'datetime-local' : 'date';
  };

  // 获取占位符
  const getPlaceholder = () => {
    if (needsTime()) {
      return '选择日期和时间';
    }
    return '选择日期';
  };

  // 验证日期
  const validateDate = (dateValue: string) => {
    if (!dateValue) return true;
    
    const date = new Date(dateValue);
    const now = new Date();
    
    // 检查是否是有效日期
    if (isNaN(date.getTime())) return false;
    
    // 根据题目内容判断日期范围
    const questionText = item.question.toLowerCase();
    
    if (questionText.includes('出生') || questionText.includes('生日')) {
      // 出生日期不能是未来
      return date <= now;
    }
    
    if (questionText.includes('计划') || questionText.includes('预约') || questionText.includes('安排')) {
      // 计划日期不能是过去
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }
    
    return true;
  };

  // 快速日期选择
  const getQuickDateOptions = () => {
    const today = new Date();
    const formatDate = (date: Date) => {
      return needsTime() 
        ? date.toISOString().slice(0, 16)
        : date.toISOString().slice(0, 10);
    };

    const options = [];
    
    // 今天
    options.push({
      label: '今天',
      value: formatDate(today)
    });
    
    // 明天
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    options.push({
      label: '明天',
      value: formatDate(tomorrow)
    });
    
    // 一周后
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    options.push({
      label: '一周后',
      value: formatDate(nextWeek)
    });

    return options;
  };

  const isValid = validateDate(value);
  const quickOptions = getQuickDateOptions();

  // 格式化显示日期
  const formatDisplayDate = (dateValue: string) => {
    if (!dateValue) return '';
    
    const date = new Date(dateValue);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    
    if (needsTime()) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('zh-CN', options);
  };

  return (
    <div className="space-y-3">
      {/* 日期类型提示 */}
      <div className="text-sm text-primary bg-primary/10 p-2 rounded border border-blue-200">
        <div className="flex items-center space-x-2">
          {needsTime() ? (
            <Clock className="w-4 h-4 text-primary" />
          ) : (
            <Calendar className="w-4 h-4 text-primary" />
          )}
          <span>
            {needsTime() ? '日期时间选择：请选择具体的日期和时间' : '日期选择：请选择日期'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor={`date-${item.itemNumber}`}
          className={`${deviceStyles.fontSize} font-medium`}
        >
          选择{needsTime() ? '日期时间' : '日期'}
        </Label>
        
        <Input
          id={`date-${item.itemNumber}`}
          type={getInputType()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            ${deviceStyles.inputSize}
            ${isFocused ? 'ring-2 ring-blue-500' : ''}
            ${!isValid && value ? 'border-red-300 focus:ring-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {/* 快速选择选项 */}
      {!disabled && deviceMode !== 'mobile' && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">{t('forms.date_picker.quick_select', '快速选择：')}</Label>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((option, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 验证状态 */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          {value && formatDisplayDate(value)}
        </div>
        
        <div className="flex items-center space-x-2">
          {value && !isValid && (
            <Badge variant="destructive" className="text-xs">
              日期无效
            </Badge>
          )}
          {value && isValid && (
            <Badge variant="outline" className="text-xs bg-success/10 text-green-700">
              {t('forms.date_picker.selected_label', '已选择')}
            </Badge>
          )}
        </div>
      </div>

      {/* 日期相关提示 */}
      {item.question.toLowerCase().includes('出生') && (
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          💡 提示：出生日期不能选择未来的日期
        </div>
      )}
      
      {item.question.toLowerCase().includes('计划') && (
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          💡 提示：计划日期不能选择过去的日期
        </div>
      )}

      {/* 选择结果预览 */}
      {value && isValid && (
        <div className="mt-3 p-3 bg-success/10 border border-green-200 rounded">
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-success/100 rounded-full mt-1.5 shrink-0"></span>
            <div className="flex-1">
              <div className="text-sm text-green-700 font-medium mb-1">您选择的{needsTime() ? '时间' : '日期'}：</div>
              <div className={`${deviceStyles.fontSize} text-success font-medium`}>
                {formatDisplayDate(value)}
              </div>
              {needsTime() && (
                <div className="text-xs text-success mt-1">
                  {new Date(value).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}