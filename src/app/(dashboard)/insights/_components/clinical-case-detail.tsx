"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  ChevronLeft,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();
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
        setError(data.error || t("insights.load_case_failed", "Failed to load case"));
      }
    } catch (error) {
      console.error("Failed to load case details:", error);
      setError(t("insights.network_error", "Network error, please try again later"));
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLevelColor = (level?: string) => {
    const colorMap = {
      'beginner': 'bg-green-100 text-green-800 border-green-200',
      'intermediate': 'bg-primary/10 text-primary border-blue-200',
      'advanced': 'bg-red-100 text-red-800 border-red-200'
    };
    return level ? colorMap[level as keyof typeof colorMap] || 'bg-gray-100 text-foreground border' : 'bg-gray-100 text-foreground border';
  };

  const getSpecialtyLabel = (specialty?: string) => {
    const labels = {
      psychiatry: t("insights.specialty.psychiatry", "Psychiatry"),
      oncology: t("insights.specialty.oncology", "Oncology"),
      neurology: t("insights.specialty.neurology", "Neurology"),
      cardiology: t("insights.specialty.cardiology", "Cardiology"),
      general: t("insights.specialty.general", "General Medicine")
    };
    return specialty ? labels[specialty as keyof typeof labels] || specialty : t("insights.specialty.unknown", "Unknown Specialty");
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t("common.loading", "Loading...")}</p>
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
            <p className="text-lg font-medium mb-2">{t("insights.cases.load_failed")}</p>
            <p className="text-muted-foreground mb-4">{error || t("insights.cases.case_not_found")}</p>
            <Button onClick={() => router.push("/insights/cases")}>
              {t("insights.cases.back_to_case_list")}
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
          onClick={() => router.push("/insights/cases")}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t("insights.cases.back_to_case_list")}
        </Button>

        <div className="space-y-6">
          {/* 案例标题 */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{clinicalCase.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {clinicalCase.difficultyLevel && (
                <Badge className={getDifficultyLevelColor(clinicalCase.difficultyLevel)}>
                  {t("insights.cases.difficulty_level")}: {clinicalCase.difficultyLevel}
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
              <CardTitle>{t("insights.cases.case_basic_info")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t("insights.cases.scale_used")}:</span>
                  <p className="text-muted-foreground">
                    {clinicalCase.scaleName} ({clinicalCase.scaleAcronym})
                  </p>
                </div>
                <div>
                  <span className="font-medium">{t("insights.cases.specialty_field")}:</span>
                  <p className="text-muted-foreground">{getSpecialtyLabel(clinicalCase.specialty)}</p>
                </div>
                <div>
                  <span className="font-medium">{t("insights.cases.difficulty_level")}:</span>
                  <p className="text-muted-foreground">{clinicalCase.difficultyLevel || t("insights.cases.not_set")}</p>
                </div>
                <div>
                  <span className="font-medium">{t("insights.cases.author")}:</span>
                  <p className="text-muted-foreground">{clinicalCase.author || t("insights.cases.unknown")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 患者背景 */}
          {clinicalCase.patientBackground && (
            <Card>
              <CardHeader>
                <CardTitle>{t("insights.cases.patient_background")}</CardTitle>
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
                <CardTitle>{t("insights.cases.score_results")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(clinicalCase.scaleScores).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-primary/10 rounded">
                      <span className="font-medium">{key}:</span>
                      <span className="text-lg font-bold text-primary">{value}</span>
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
                <CardTitle>{t("insights.cases.result_interpretation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-primary/10 p-3 rounded">
                  {clinicalCase.interpretation}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 临床决策 */}
          {clinicalCase.clinicalDecision && (
            <Card>
              <CardHeader>
                <CardTitle>{t("insights.cases.clinical_decision")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-success/10 p-3 rounded">
                  {clinicalCase.clinicalDecision}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 治疗结果 */}
          {clinicalCase.outcome && (
            <Card>
              <CardHeader>
                <CardTitle>{t("insights.cases.treatment_outcome")}</CardTitle>
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
                <CardTitle>{t("insights.cases.learning_points")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  {clinicalCase.learningPoints.split('\n').map((point, index) => (
                    <div key={index} className="flex items-start">
                      <Target className="w-4 h-4 mr-2 mt-0.5 text-success flex-shrink-0" />
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
              <CardTitle>{t("insights.cases.related_resources")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Link href={`/scales/${clinicalCase.scaleId}`}>
                  <Button variant="outline">
                    {t("insights.cases.view_scale_details")}
                  </Button>
                </Link>
                <Link href={`/scales/${clinicalCase.scaleId}/preview`}>
                  <Button variant="outline">
                    {t("insights.cases.preview_scale")}
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