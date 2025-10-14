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
  const { t } = useLanguage();
  const toast = useToast();
  const router = useRouter();

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
      toast.error(t('admin.interpretations.create.error_select_scale'));
      return;
    }

    if (!formData.overview && !formData.structure && !formData.interpretation) {
      toast.error(t('admin.interpretations.create.error_fill_one_section'));
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
        toast.success(t('admin.interpretations.create.success_created'));
        router.push('/admin/interpretations');
      } else {
        toast.error(data.message || t('admin.interpretations.create.error_create_failed'));
      }
    } catch (error) {
      console.error('Failed to create interpretation:', error);
      toast.error(t('admin.interpretations.create.error_create_failed'));
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
          {t('admin.interpretations.create.back')}
        </Button>
        <h1 className="text-3xl font-bold">
          {t('admin.interpretations.create.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.interpretations.create.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.interpretations.create.basic_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scaleId">{t('admin.interpretations.create.select_scale_required')}</Label>
                <Select
                  value={formData.scaleId}
                  onValueChange={(value) => setFormData({ ...formData, scaleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.interpretations.create.placeholder_select_scale')} />
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
                <Label htmlFor="language">{t('admin.interpretations.create.language')}</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">{t('admin.interpretations.create.language_chinese')}</SelectItem>
                    <SelectItem value="en">{t('admin.interpretations.create.language_english')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">{t('admin.interpretations.create.overview_label')}</Label>
              <Textarea
                id="overview"
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                placeholder={t('admin.interpretations.create.placeholder_overview')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="structure">{t('admin.interpretations.create.structure_label')}</Label>
              <Textarea
                id="structure"
                value={formData.structure}
                onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                placeholder={t('admin.interpretations.create.placeholder_structure')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychometricProperties">{t('admin.interpretations.create.psychometric_label')}</Label>
              <Textarea
                id="psychometricProperties"
                value={formData.psychometricProperties}
                onChange={(e) => setFormData({ ...formData, psychometricProperties: e.target.value })}
                placeholder={t('admin.interpretations.create.placeholder_psychometric')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interpretation">{t('admin.interpretations.create.interpretation_label')}</Label>
              <Textarea
                id="interpretation"
                value={formData.interpretation}
                onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                placeholder={t('admin.interpretations.create.placeholder_interpretation')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageGuidelines">{t('admin.interpretations.create.usage_label')}</Label>
              <Textarea
                id="usageGuidelines"
                value={formData.usageGuidelines}
                onChange={(e) => setFormData({ ...formData, usageGuidelines: e.target.value })}
                placeholder={t('admin.interpretations.create.placeholder_usage')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicalApplications">{t('admin.interpretations.create.clinical_label')}</Label>
              <Textarea
                id="clinicalApplications"
                value={formData.clinicalApplications}
                onChange={(e) => setFormData({ ...formData, clinicalApplications: e.target.value })}
                placeholder={t('admin.interpretations.create.placeholder_clinical')}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t('admin.interpretations.create.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? t('admin.interpretations.create.saving') : t('admin.interpretations.create.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
