'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface Scale {
  id: string;
  name: string;
  acronym: string;
}

export default function CreateInterpretationPage() {
  const { language } = useLanguage();
  const toast = useToast();
  const router = useRouter();
  const isZh = language === 'zh';

  const [loading, setLoading] = useState(false);
  const [scales, setScales] = useState<Scale[]>([]);
  const [formData, setFormData] = useState({
    scaleId: '',
    overview: '',
    structure: '',
    psychometricProperties: '',
    interpretation: '',
    usageGuidelines: '',
    clinicalApplications: '',
    language: 'zh',
  });

  useEffect(() => {
    fetchScales();
  }, []);

  const fetchScales = async () => {
    try {
      const response = await fetch('/api/admin/scales?limit=1000');
      const data = await response.json();
      if (data.success) {
        setScales(data.scales);
      }
    } catch (error) {
      console.error('Failed to fetch scales:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scaleId) {
      toast.error(isZh ? '请选择量表' : 'Please select a scale');
      return;
    }

    if (!formData.overview && !formData.structure && !formData.interpretation) {
      toast.error(isZh ? '请至少填写一个部分' : 'Please fill at least one section');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/interpretations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          generationMethod: 'manual',
          status: 'draft',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isZh ? '创建成功' : 'Created successfully');
        router.push('/admin/interpretations');
      } else {
        toast.error(data.message || (isZh ? '创建失败' : 'Failed to create'));
      }
    } catch (error) {
      console.error('Failed to create interpretation:', error);
      toast.error(isZh ? '创建失败' : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="text-3xl font-bold">
          {isZh ? '新建量表解读' : 'Create Interpretation'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isZh ? '手动创建专业的量表解读内容' : 'Manually create professional scale interpretation'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scaleId">选择量表 *</Label>
                <Select
                  value={formData.scaleId}
                  onValueChange={(value) => setFormData({ ...formData, scaleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择量表" />
                  </SelectTrigger>
                  <SelectContent>
                    {scales.map((scale) => (
                      <SelectItem key={scale.id} value={scale.id}>
                        {scale.name} ({scale.acronym})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">语言</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">1. 量表概述</Label>
              <Textarea
                id="overview"
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                placeholder="介绍量表的基本信息、用途和背景..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="structure">2. 量表结构</Label>
              <Textarea
                id="structure"
                value={formData.structure}
                onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                placeholder="描述量表的维度、题目数量、计分方式等..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychometricProperties">3. 心理测量学特性</Label>
              <Textarea
                id="psychometricProperties"
                value={formData.psychometricProperties}
                onChange={(e) => setFormData({ ...formData, psychometricProperties: e.target.value })}
                placeholder="说明量表的信度、效度、常模等心理测量学指标..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interpretation">4. 结果解释</Label>
              <Textarea
                id="interpretation"
                value={formData.interpretation}
                onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                placeholder="如何解释量表得分、不同分数段的含义..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageGuidelines">5. 使用指南</Label>
              <Textarea
                id="usageGuidelines"
                value={formData.usageGuidelines}
                onChange={(e) => setFormData({ ...formData, usageGuidelines: e.target.value })}
                placeholder="量表的适用范围、使用注意事项、施测要求..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicalApplications">6. 临床应用</Label>
              <Textarea
                id="clinicalApplications"
                value={formData.clinicalApplications}
                onChange={(e) => setFormData({ ...formData, clinicalApplications: e.target.value })}
                placeholder="量表在临床实践中的应用场景和案例..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? '保存中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
