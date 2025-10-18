'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Palette, 
  Eraser, 
  RotateCcw, 
  Download, 
  Brush,
  Circle,
  Square,
  Minus
} from 'lucide-react';
import type { EcoaItem } from '@/db/schema';

interface DrawingQuestionRendererProps {
  item: EcoaItem;
  itemIndex: number;
  value: string; // base64 encoded image data
  onChange: (value: string) => void;
  disabled?: boolean;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

type DrawingTool = 'pen' | 'eraser' | 'circle' | 'rectangle' | 'line';

export function DrawingQuestionRenderer({
  item,
  itemIndex,
  value = '',
  onChange,
  disabled = false,
  deviceMode = 'desktop'
}: DrawingQuestionRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // 设备响应式样式
  const getDeviceStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          fontSize: 'text-sm',
          padding: 'p-3',
          canvasSize: { width: 300, height: 200 }
        };
      case 'tablet':
        return {
          fontSize: 'text-base',
          padding: 'p-4',
          canvasSize: { width: 450, height: 300 }
        };
      default:
        return {
          fontSize: 'text-base',
          padding: 'p-4',
          canvasSize: { width: 600, height: 400 }
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  useEffect(() => {
    setCanvasSize(deviceStyles.canvasSize);
  }, [deviceMode]);

  useEffect(() => {
    // 如果有已保存的图像数据，加载到画布
    if (value && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      
      img.src = value;
    }
  }, [value]);

  // 获取鼠标/触摸位置
  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      // 触摸事件
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // 鼠标事件
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  // 开始绘制
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getEventPos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  // 绘制过程
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getEventPos(e);
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  // 结束绘制
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // 保存画布内容
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onChange(dataURL);
    }
  };

  // 清空画布
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 设置白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onChange('');
    }
  };

  // 下载图像
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `drawing-question-${item.itemNumber}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && !value) {
      // 设置白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasSize]);

  const toolOptions = [
    { tool: 'pen' as DrawingTool, icon: Brush, label: '画笔' },
    { tool: 'eraser' as DrawingTool, icon: Eraser, label: '橡皮擦' },
  ];

  const colorOptions = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#8b4513'
  ];

  return (
    <div className="space-y-4">
      {/* 画图类型提示 */}
      <div className="text-sm text-primary bg-primary/10 p-2 rounded border border-blue-200">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-primary" />
          <span>画图题：请使用画板工具绘制您的答案</span>
        </div>
      </div>

      {/* 工具栏 */}
      {!disabled && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
          {/* 工具选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">绘图工具</Label>
            <div className="flex flex-wrap gap-2">
              {toolOptions.map(({ tool, icon: Icon, label }) => (
                <Button
                  key={tool}
                  type="button"
                  variant={currentTool === tool ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool(tool)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* 颜色选择 */}
          {currentTool !== 'eraser' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">颜色</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBrushColor(color)}
                    className={`
                      w-8 h-8 rounded border transition-all
                      ${brushColor === color ? 'border scale-110' : 'border'}
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 rounded border border cursor-pointer"
                  title="自定义颜色"
                />
              </div>
            </div>
          )}

          {/* 画笔大小 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              画笔大小: {brushSize}px
            </Label>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>清空</span>
            </Button>
            
            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadImage}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>下载</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 画布区域 */}
      <div className="space-y-2">
        <Label className={`${deviceStyles.fontSize} font-medium`}>
          绘图区域
        </Label>
        
        <div className="border border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={`
              block w-full h-auto cursor-crosshair
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ touchAction: 'none' }}
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          画布尺寸: {canvasSize.width} × {canvasSize.height} 像素
        </div>
      </div>

      {/* 绘制状态 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-muted-foreground">
            当前工具: {toolOptions.find(t => t.tool === currentTool)?.label}
          </span>
          {currentTool !== 'eraser' && (
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">颜色:</span>
              <div 
                className="w-4 h-4 rounded border border"
                style={{ backgroundColor: brushColor }}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {value && (
            <Badge variant="outline" className="text-xs bg-success/10 text-green-700">
              已绘制
            </Badge>
          )}
        </div>
      </div>

      {/* 绘制结果预览 */}
      {value && (
        <div className="mt-3 p-3 bg-success/10 border border-green-200 rounded">
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-success/100 rounded-full mt-1.5 shrink-0"></span>
            <div className="flex-1">
              <div className="text-sm text-green-700 font-medium mb-2">您的绘制内容：</div>
              <div className="border border-green-300 rounded bg-white inline-block">
                <img 
                  src={value} 
                  alt="绘制内容预览"
                  className="max-w-full h-auto"
                  style={{ maxHeight: '150px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
        💡 使用提示：
        {deviceMode === 'mobile' 
          ? '使用手指在画布上绘制，支持多点触控'
          : '使用鼠标在画布上绘制，支持各种绘图工具'
        }
      </div>
    </div>
  );
}