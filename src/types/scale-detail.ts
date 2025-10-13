/**
 * 量表详情页面的类型定义
 */

export interface ScaleItem {
  id: string;
  itemNumber: number;
  question: string;
  questionEn?: string | null;
  dimension?: string | null;
  responseType: string;
  responseOptions?: string[] | null;
  scoringInfo?: string | null;
  isRequired?: number;
  sortOrder?: number;
}

export interface ScaleDetail {
  id: string;
  name: string;
  nameEn?: string | null;
  acronym?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  itemsCount?: number;
  dimensionsCount?: number;
  languages?: string[];
  validationStatus?: string;
  scoringMethod?: string | null;
  administrationTime?: number | null;
  targetPopulation?: string | null;
  ageRange?: string | null;
  domains?: string[];
  psychometricProperties?: Record<string, unknown> | null;
  references?: string[];
  downloadUrl?: string | null;
  isPublic?: number;
  usageCount?: number;
  favoriteCount?: number;
  copyrightHolderId?: string | null;
  licenseType?: string | null;
  copyrightInfo?: string | null;
  licenseTerms?: string | null;
  usageRestrictions?: string | null;
  createdAt?: number | Date;
  updatedAt?: number | Date;
}

export interface UserInteraction {
  isFavorited: boolean;
  favoriteId?: string | null;
  hasAccess: boolean;
  canDownload: boolean;
}

export interface RelatedScale {
  id: string;
  name: string;
  nameEn?: string | null;
  acronym?: string | null;
  description?: string | null;
  itemsCount?: number;
  similarityScore?: number;
}

export interface ScaleStatistics {
  totalViews: number;
  totalDownloads: number;
  totalFavorites: number;
  averageRating?: number;
}

export interface ScalePageMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface ScaleDetailPageData {
  scale: ScaleDetail;
  items: ScaleItem[];
  userInteraction: UserInteraction;
  relatedScales: RelatedScale[];
  statistics: ScaleStatistics;
  meta: ScalePageMeta;
}
