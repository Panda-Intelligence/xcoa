import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import { commonColumns } from './shared';
import { ecoaScaleTable } from './scale';
import { userTable } from './user';

/**
 * 量表解读表
 * 存储 AI 生成和人工审核的量表解读内容
 */
export const scaleInterpretationTable = sqliteTable("scale_interpretation", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `interp_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id, { onDelete: 'cascade' }),
  
  // 解读内容（6个核心部分）
  overview: text({ length: 5000 }),              // 量表概述
  structure: text({ length: 5000 }),             // 量表结构
  psychometricProperties: text({ length: 5000 }), // 心理测量学特性
  interpretation: text({ length: 5000 }),        // 结果解释
  usageGuidelines: text({ length: 5000 }),       // 使用指南
  clinicalApplications: text({ length: 5000 }),  // 临床应用
  
  // 完整原始内容（Markdown格式）
  rawContent: text({ length: 30000 }),
  
  // 生成方式和状态
  generationMethod: text({ length: 20 }).notNull(), // 'ai' | 'manual' | 'hybrid'
  status: text({ length: 20 }).notNull().default('draft'), // 'draft' | 'reviewing' | 'approved' | 'published'
  language: text({ length: 2 }).notNull().default('zh'), // 'zh' | 'en'
  
  // AI 生成相关
  aiModel: text({ length: 100 }),               // AI 模型名称
  aiPromptVersion: text({ length: 50 }),        // 提示词版本
  aiTokensUsed: integer(),                      // 使用的 token 数
  aiGeneratedAt: integer({ mode: "timestamp" }), // AI 生成时间
  aiConfidence: real(),                         // AI 置信度 (0-1)
  
  // 审核相关
  needsVerification: integer().notNull().default(1), // 是否需要专家验证
  reviewedBy: text().references(() => userTable.id),  // 审核人
  reviewedAt: integer({ mode: "timestamp" }),         // 审核时间
  reviewNotes: text({ length: 2000 }),               // 审核意见
  
  // 发布相关
  publishedAt: integer({ mode: "timestamp" }),        // 发布时间
  publishedBy: text().references(() => userTable.id), // 发布人
  
  // 版本控制
  version: integer().notNull().default(1),
  
  // 质量评分（审核后）
  qualityScore: real(),                         // 质量评分 (0-100)
  completenessScore: real(),                    // 完整性评分 (0-100)
  accuracyScore: real(),                        // 准确性评分 (0-100)
  
  // 统计
  viewCount: integer().notNull().default(0),    // 查看次数
  helpfulCount: integer().notNull().default(0), // 有帮助的次数
  
}, (table) => ([
  index('scale_interpretation_scale_id_idx').on(table.scaleId),
  index('scale_interpretation_status_idx').on(table.status),
  index('scale_interpretation_language_idx').on(table.language),
  index('scale_interpretation_reviewed_by_idx').on(table.reviewedBy),
]));

/**
 * 解读修订历史表
 * 记录每次修改的历史版本
 */
export const interpretationHistoryTable = sqliteTable("interpretation_history", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `ihist_${createId()}`).notNull(),
  interpretationId: text().notNull().references(() => scaleInterpretationTable.id, { onDelete: 'cascade' }),
  
  version: integer().notNull(),
  
  // 变更内容（JSON格式）
  changes: text({ length: 10000 }).notNull(), // { field: string, oldValue: string, newValue: string }[]
  changeType: text({ length: 20 }).notNull(), // 'create' | 'update' | 'review' | 'publish'
  changeSummary: text({ length: 500 }),       // 变更摘要
  
  // 变更人
  changedBy: text().notNull().references(() => userTable.id),
  changeReason: text({ length: 1000 }),       // 变更原因
  
}, (table) => ([
  index('interpretation_history_interpretation_id_idx').on(table.interpretationId),
  index('interpretation_history_version_idx').on(table.version),
  index('interpretation_history_changed_by_idx').on(table.changedBy),
]));

/**
 * 专家反馈表
 * 收集专家对解读内容的反馈和建议
 */
export const interpretationFeedbackTable = sqliteTable("interpretation_feedback", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `ifeed_${createId()}`).notNull(),
  interpretationId: text().notNull().references(() => scaleInterpretationTable.id, { onDelete: 'cascade' }),
  
  // 专家信息
  expertId: text().references(() => userTable.id),
  expertName: text({ length: 100 }),
  expertEmail: text({ length: 255 }),
  expertCredentials: text({ length: 500 }),   // 专家资质描述
  expertAffiliation: text({ length: 200 }),   // 所属机构
  
  // 反馈内容
  section: text({ length: 50 }),              // 反馈的部分：overview/structure/psychometric等
  feedbackType: text({ length: 20 }).notNull(), // 'correction' | 'addition' | 'suggestion' | 'praise'
  severity: text({ length: 20 }),             // 'critical' | 'major' | 'minor' | 'cosmetic'
  content: text({ length: 5000 }).notNull(),  // 反馈内容
  suggestedChange: text({ length: 5000 }),    // 建议的修改
  references: text({ length: 1000 }),         // 参考文献
  
  // 处理状态
  status: text({ length: 20 }).notNull().default('pending'), // 'pending' | 'reviewing' | 'applied' | 'rejected'
  resolvedBy: text().references(() => userTable.id),
  resolvedAt: integer({ mode: "timestamp" }),
  resolutionNotes: text({ length: 1000 }),
  
  // 评分
  helpfulnessRating: integer(),               // 1-5 星评分
  
}, (table) => ([
  index('interpretation_feedback_interpretation_id_idx').on(table.interpretationId),
  index('interpretation_feedback_expert_id_idx').on(table.expertId),
  index('interpretation_feedback_status_idx').on(table.status),
  index('interpretation_feedback_feedback_type_idx').on(table.feedbackType),
]));

/**
 * 用户反馈表
 * 收集普通用户对解读内容的反馈
 */
export const interpretationUserFeedbackTable = sqliteTable("interpretation_user_feedback", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `iufeed_${createId()}`).notNull(),
  interpretationId: text().notNull().references(() => scaleInterpretationTable.id, { onDelete: 'cascade' }),
  userId: text().notNull().references(() => userTable.id),
  
  // 反馈类型
  isHelpful: integer().notNull(),             // 1=有帮助, 0=没帮助
  rating: integer(),                          // 1-5 星评分
  comment: text({ length: 1000 }),            // 评论
  
  // 具体问题
  issueType: text({ length: 50 }),            // 'inaccurate' | 'outdated' | 'unclear' | 'missing' | 'other'
  issueDescription: text({ length: 2000 }),
  
}, (table) => ([
  index('interpretation_user_feedback_interpretation_id_idx').on(table.interpretationId),
  index('interpretation_user_feedback_user_id_idx').on(table.userId),
  // Unique constraint: 每个用户只能对同一个解读反馈一次
  index('interpretation_user_feedback_unique_idx').on(table.interpretationId, table.userId),
]));

/**
 * 解读引用文献表
 * 存储解读中引用的文献
 */
export const interpretationReferenceTable = sqliteTable("interpretation_reference", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `iref_${createId()}`).notNull(),
  interpretationId: text().notNull().references(() => scaleInterpretationTable.id, { onDelete: 'cascade' }),
  
  // 文献信息
  title: text({ length: 500 }).notNull(),
  authors: text({ length: 500 }),
  year: integer(),
  journal: text({ length: 200 }),
  volume: text({ length: 50 }),
  issue: text({ length: 50 }),
  pages: text({ length: 50 }),
  doi: text({ length: 200 }),
  pmid: text({ length: 50 }),
  url: text({ length: 500 }),
  
  // 引用类型
  referenceType: text({ length: 50 }).notNull(), // 'original' | 'validation' | 'review' | 'guideline' | 'other'
  section: text({ length: 50 }),                 // 在哪个部分引用
  
  // 显示顺序
  displayOrder: integer().notNull().default(0),
  
}, (table) => ([
  index('interpretation_reference_interpretation_id_idx').on(table.interpretationId),
  index('interpretation_reference_doi_idx').on(table.doi),
]));

// Relations
export const scaleInterpretationRelations = relations(scaleInterpretationTable, ({ one, many }) => ({
  scale: one(ecoaScaleTable, {
    fields: [scaleInterpretationTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
  reviewer: one(userTable, {
    fields: [scaleInterpretationTable.reviewedBy],
    references: [userTable.id],
  }),
  publisher: one(userTable, {
    fields: [scaleInterpretationTable.publishedBy],
    references: [userTable.id],
  }),
  history: many(interpretationHistoryTable),
  expertFeedback: many(interpretationFeedbackTable),
  userFeedback: many(interpretationUserFeedbackTable),
  references: many(interpretationReferenceTable),
}));

export const interpretationHistoryRelations = relations(interpretationHistoryTable, ({ one }) => ({
  interpretation: one(scaleInterpretationTable, {
    fields: [interpretationHistoryTable.interpretationId],
    references: [scaleInterpretationTable.id],
  }),
  changer: one(userTable, {
    fields: [interpretationHistoryTable.changedBy],
    references: [userTable.id],
  }),
}));

export const interpretationFeedbackRelations = relations(interpretationFeedbackTable, ({ one }) => ({
  interpretation: one(scaleInterpretationTable, {
    fields: [interpretationFeedbackTable.interpretationId],
    references: [scaleInterpretationTable.id],
  }),
  expert: one(userTable, {
    fields: [interpretationFeedbackTable.expertId],
    references: [userTable.id],
  }),
  resolver: one(userTable, {
    fields: [interpretationFeedbackTable.resolvedBy],
    references: [userTable.id],
  }),
}));

export const interpretationUserFeedbackRelations = relations(interpretationUserFeedbackTable, ({ one }) => ({
  interpretation: one(scaleInterpretationTable, {
    fields: [interpretationUserFeedbackTable.interpretationId],
    references: [scaleInterpretationTable.id],
  }),
  user: one(userTable, {
    fields: [interpretationUserFeedbackTable.userId],
    references: [userTable.id],
  }),
}));

export const interpretationReferenceRelations = relations(interpretationReferenceTable, ({ one }) => ({
  interpretation: one(scaleInterpretationTable, {
    fields: [interpretationReferenceTable.interpretationId],
    references: [scaleInterpretationTable.id],
  }),
}));
