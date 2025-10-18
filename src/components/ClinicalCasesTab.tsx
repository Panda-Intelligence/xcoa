'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Beaker,
  Users,
  Clock,
  Target,
  Award,
  BookOpen,
  ExternalLink,
  TrendingUp,
  Building,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface ClinicalCase {
  id: string;
  title: string;
  trialId: string;
  phase: string;
  studyType: string;
  patientCount: number;
  duration: string;
  sponsor: string;
  primaryOutcome: string;
  results: string;
  publication: string;
  evidenceLevel: string;
  clinicalSignificance: string;
}

interface ClinicalCasesTabProps {
  scaleId: string;
  scaleAcronym: string;
}

export function ClinicalCasesTab({ scaleId, scaleAcronym }: ClinicalCasesTabProps) {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>({});
  const [applicationGuidance, setApplicationGuidance] = useState<any>({});

  useEffect(() => {
    fetchScaleCases();
  }, [scaleId]);

  const fetchScaleCases = async () => {
    try {
      const response = await fetch(`/api/scales/${scaleId}/cases`);
      const data = await response.json();

      if (data.success) {
        setCases(data.cases || []);
        setStatistics(data.statistics || {});
        setApplicationGuidance(data.applicationGuidance || {});
      }
    } catch (error) {
      console.error('加载临床案例失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEvidenceLevelColor = (level: string) => {
    const colorMap = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-primary/10 text-primary',
      'C': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[level as keyof typeof colorMap] || 'bg-gray-100 text-foreground';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-8">
        <Beaker className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">暂无临床试验案例</h3>
        <p className="text-muted-foreground mb-4">
          该量表的临床试验案例正在收集中
        </p>
        <Link href="/insights/cases">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            浏览全部案例
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <Card className="bg-primary/10 border-blue-200">
        <CardHeader>
          <CardTitle className="text-primary">
            {scaleAcronym} 临床试验应用统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{statistics.totalCases}</div>
              <div className="text-sm text-primary">试验案例</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{statistics.evidenceLevelA}</div>
              <div className="text-sm text-primary">A级证据</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{statistics.rctStudies}</div>
              <div className="text-sm text-primary">RCT研究</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{statistics.totalPatients}</div>
              <div className="text-sm text-primary">总入组患者</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 应用指导 */}
      {applicationGuidance && (
        <Card>
          <CardHeader>
            <CardTitle>临床试验应用指导</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h5 className="font-medium text-sm mb-1">主要用途</h5>
              <p className="text-sm text-muted-foreground">{applicationGuidance.primaryUse}</p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-1">试验设计</h5>
              <p className="text-sm text-muted-foreground">{applicationGuidance.trialDesign}</p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-1">评估时机</h5>
              <p className="text-sm text-muted-foreground">{applicationGuidance.timing}</p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-1">结果解读</h5>
              <p className="text-sm text-muted-foreground">{applicationGuidance.interpretation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 案例列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">代表性研究案例</h3>
        {cases.map((clinicalCase) => (
          <Card key={clinicalCase.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {clinicalCase.trialId}
                    </Badge>
                    <Badge className={getEvidenceLevelColor(clinicalCase.evidenceLevel)}>
                      {clinicalCase.evidenceLevel}级
                    </Badge>
                    <Badge variant="outline">{clinicalCase.phase}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {clinicalCase.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {clinicalCase.patientCount}例
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {clinicalCase.duration}
                    </span>
                    <span className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {clinicalCase.sponsor}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">主要终点</h5>
                  <p className="text-sm text-muted-foreground bg-primary/10 p-2 rounded">
                    {clinicalCase.primaryOutcome}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-1">关键结果</h5>
                  <p className="text-sm text-muted-foreground bg-success/10 p-2 rounded">
                    {clinicalCase.results}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-1">临床意义</h5>
                  <p className="text-sm text-muted-foreground">
                    {clinicalCase.clinicalSignificance}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <BookOpen className="w-3 h-3" />
                    <span>{clinicalCase.publication.split('.')[0]}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    查看原文
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 查看更多案例 */}
      <Card>
        <CardContent className="text-center py-6">
          <h4 className="font-medium mb-2">探索更多临床案例</h4>
          <p className="text-sm text-muted-foreground mb-4">
            查看更多量表在临床试验中的应用案例
          </p>
          <Link href="/insights/cases">
            <Button>
              <Beaker className="w-4 h-4 mr-2" />
              浏览案例库
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}