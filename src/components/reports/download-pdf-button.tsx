'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { generateReportPDF } from '@/utils/pdf-generator';
import { toast } from 'sonner';

interface DownloadReportPDFButtonProps {
  reportData: {
    id: string;
    scaleName: string;
    scaleDescription?: string;
    totalScore: number;
    maxScore: number;
    completionRate: number;
    dimensionScores: Record<string, any>;
    interpretation?: string;
    severity?: string;
    recommendations?: string[];
    generatedAt: Date | string;
    sessionId: string;
    metadata?: Record<string, any>;
  };
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function DownloadReportPDFButton({
  reportData,
  variant = 'default',
  size = 'default',
  className,
}: DownloadReportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      toast.info('正在生成PDF报告...');

      // Generate PDF
      const generator = generateReportPDF(reportData);

      // Download PDF
      const filename = `${reportData.scaleName}_评估报告_${new Date().toISOString().split('T')[0]}.pdf`;
      generator.savePDF(filename);

      toast.success('PDF报告已生成！');
    } catch (error) {
      console.error('PDF生成失败:', error);
      toast.error('PDF生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          生成中...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          下载PDF
        </>
      )}
    </Button>
  );
}
