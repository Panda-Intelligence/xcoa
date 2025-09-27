import { sqliteTable, real, integer, text, index } from "drizzle-orm/sqlite-core";
import { commonColumns } from "./shared";
import { createId } from "@paralleldrive/cuid2";
import { ecoaScaleTable } from "./scale";
import { type InferSelectModel, relations } from "drizzle-orm";

// 量表常模数据表
export const scaleNormsTable = sqliteTable("scale_norms", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `norm_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  populationType: text({ length: 100 }).notNull(), // general, clinical, elderly, pediatric
  sampleSize: integer(),
  meanScore: real(),
  stdDeviation: real(),
  minScore: real(),
  maxScore: real(),
  percentiles: text({ mode: 'json' }).$type<Record<string, number>>(), // {p25: x, p50: x, p75: x, p90: x, p95: x}
  ageRange: text({ length: 50 }),
  gender: text({ length: 20 }), // male, female, mixed
  educationLevel: text({ length: 100 }),
  culturalBackground: text({ length: 100 }),
  studyReference: text({ length: 500 }),
}, (table) => ([
  index('scale_norms_scale_id_idx').on(table.scaleId),
  index('scale_norms_population_idx').on(table.populationType),
]));

// 量表解读指导表
export const scaleInterpretationsTable = sqliteTable("scale_interpretations", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `interp_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  scoreRangeMin: integer(),
  scoreRangeMax: integer(),
  severityLevel: text({ length: 50 }), // minimal, mild, moderate, severe
  interpretationZh: text({ length: 1000 }),
  interpretationEn: text({ length: 1000 }),
  clinicalSignificance: text({ length: 1000 }),
  recommendations: text({ length: 1000 }),
  followUpGuidance: text({ length: 1000 }),
}, (table) => ([
  index('interpretations_scale_id_idx').on(table.scaleId),
  index('interpretations_score_range_idx').on(table.scoreRangeMin, table.scoreRangeMax),
]));

// 量表使用指南表
export const scaleGuidelinesTable = sqliteTable("scale_guidelines", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `guide_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  guidelineType: text({ length: 50 }), // administration, scoring, interpretation
  title: text({ length: 255 }).notNull(),
  content: text({ length: 5000 }),
  targetAudience: text({ length: 100 }), // clinician, researcher, student
  evidenceLevel: text({ length: 5 }), // A, B, C
  lastUpdated: integer({ mode: 'timestamp' }),
  version: text({ length: 20 }),
}, (table) => ([
  index('guidelines_scale_id_idx').on(table.scaleId),
  index('guidelines_type_idx').on(table.guidelineType),
]));


// 新增关系定义
export const scaleNormsRelations = relations(scaleNormsTable, ({ one }) => ({
  scale: one(ecoaScaleTable, {
    fields: [scaleNormsTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
}));

export const scaleInterpretationsRelations = relations(scaleInterpretationsTable, ({ one }) => ({
  scale: one(ecoaScaleTable, {
    fields: [scaleInterpretationsTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
}));

export type ScaleNorms = InferSelectModel<typeof scaleNormsTable>;
export type ScaleInterpretations = InferSelectModel<typeof scaleInterpretationsTable>;

export type ScaleGuidelines = InferSelectModel<typeof scaleGuidelinesTable>;