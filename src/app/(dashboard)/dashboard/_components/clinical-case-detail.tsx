"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Target,
  Building,
  Users,
  Clock,
  ChevronLeft,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ClinicalCase {
  id: string;
  title: string;
  scaleId: string;
  scaleName: string;
  scaleNameEn?: string;
  scaleAcronym: string;
  scaleDescription?: string;
  patientBackground?: string;
  scaleScores?: Record<string, number>;
  interpretation?: string;
  clinicalDecision?: string;
  outcome?: string;
  learningPoints?: string;
  difficultyLevel?: string;
  specialty?: string;
  author?: string;
  reviewStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface ClinicalCaseDetailProps {
  caseId: string;
}

export function ClinicalCaseDetail({ caseId }: ClinicalCaseDetailProps) {
  const router = useRouter();
  const [clinicalCase, setClinicalCase] = useState<ClinicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCaseDetail();
  }, [caseId]);

  const fetchCaseDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clinical-cases/${caseId}`);
      const data = await response.json();

      if (data.success) {
        setClinicalCase(data.case);
      } else {
        setError(data.error || "加载案例失败");
      }
    } catch (error) {
      console.error("加载案例详情失败:", error);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLevelColor = (level?: string) => {
    const colorMap = {
      'beginner': 'bg-green-100 text-green-800 border-green-200',
      'intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
      'advanced': 'bg-red-100 text-red-800 border-red-200'
    };
    return level ? colorMap[level as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSpecialtyLabel = (specialty?: string) => {
    const labels = {
      psychiatry: '精神科',
      oncology: '肿瘤学',
      neurology: '神经科学',
      cardiology: '心脏病学',
      general: '全科医学'
    };
    return specialty ? labels[specialty as keyof typeof labels] || specialty : '未知专科';
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clinicalCase) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">加载失败</p>
            <p className="text-muted-foreground mb-4">{error || "案例不存在"}</p>
            <Button onClick={() => router.push("/dashboard/cases")}>
              返回案例列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/cases")}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          返回案例列表
        </Button>

        <div className="space-y-6">
          {/* 案例标题 */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{clinicalCase.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {clinicalCase.difficultyLevel && (
                <Badge className={getDifficultyLevelColor(clinicalCase.difficultyLevel)}>
                  难度等级: {clinicalCase.difficultyLevel}
                </Badge>
              )}
              {clinicalCase.specialty && (
                <Badge variant="outline">{getSpecialtyLabel(clinicalCase.specialty)}</Badge>
              )}
              <Badge variant="secondary">{clinicalCase.scaleAcronym}</Badge>
            </div>
          </div>

          {/* 案例基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>案例基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">使用量表:</span>
                  <p className="text-muted-foreground">
                    {clinicalCase.scaleName} ({clinicalCase.scaleAcronym})
                  </p>
                </div>
                <div>
                  <span className="font-medium">专科领域:</span>
                  <p className="text-muted-foreground">{getSpecialtyLabel(clinicalCase.specialty)}</p>
                </div>
                <div>
                  <span className="font-medium">难度等级:</span>
                  <p className="text-muted-foreground">{clinicalCase.difficultyLevel || "未设定"}</p>
                </div>
                <div>
                  <span className="font-medium">作者:</span>
                  <p className="text-muted-foreground">{clinicalCase.author || "未知"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 患者背景 */}
          {clinicalCase.patientBackground && (
            <Card>
              <CardHeader>
                <CardTitle>患者背景</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {clinicalCase.patientBackground}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 量表评分结果 */}
          {clinicalCase.scaleScores && Object.keys(clinicalCase.scaleScores).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>量表评分结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(clinicalCase.scaleScores).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="font-medium">{key}:</span>
                      <span className="text-lg font-bold text-blue-600">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 结果解读 */}
          {clinicalCase.interpretation && (
            <Card>
              <CardHeader>
                <CardTitle>结果解读</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                  {clinicalCase.interpretation}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 临床决策 */}
          {clinicalCase.clinicalDecision && (
            <Card>
              <CardHeader>
                <CardTitle>临床决策</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded">
                  {clinicalCase.clinicalDecision}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 治疗结果 */}
          {clinicalCase.outcome && (
            <Card>
              <CardHeader>
                <CardTitle>治疗结果</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded">
                  {clinicalCase.outcome}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 学习要点 */}
          {clinicalCase.learningPoints && (
            <Card>
              <CardHeader>
                <CardTitle>学习要点</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  {clinicalCase.learningPoints.split('\n').map((point, index) => (
                    <div key={index} className="flex items-start">
                      <Target className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                      {point}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 相关链接 */}
          <Card>
            <CardHeader>
              <CardTitle>相关资源</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Link href={`/scales/${clinicalCase.scaleId}`}>
                  <Button variant="outline">
                    查看量表详情
                  </Button>
                </Link>
                <Link href={`/scales/${clinicalCase.scaleId}/preview`}>
                  <Button variant="outline">
                    预览量表
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}