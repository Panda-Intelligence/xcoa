import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'
import { commonColumns } from "./shared";
import { ecoaScaleTable } from "./scale";

// 临床案例表
export const clinicalCasesTable = sqliteTable("clinical_cases", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `case_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  caseTitle: text({ length: 255 }).notNull(),
  patientBackground: text({ length: 1000 }),
  scaleScores: text({ mode: 'json' }).$type<Record<string, number>>(), // {total: x, domain1: x}
  interpretation: text({ length: 2000 }),
  clinicalDecision: text({ length: 1000 }),
  outcome: text({ length: 1000 }),
  learningPoints: text({ length: 1000 }),
  difficultyLevel: text({ length: 20 }), // beginner, intermediate, advanced
  specialty: text({ length: 100 }), // psychiatry, oncology, neurology
  author: text({ length: 255 }),
  reviewStatus: text({ length: 20 }).default('draft'), // draft, reviewed, published
}, (table) => ([
  index('clinical_cases_scale_id_idx').on(table.scaleId),
  index('clinical_cases_specialty_idx').on(table.specialty),
  index('clinical_cases_difficulty_idx').on(table.difficultyLevel),
]));

export const clinicalCasesRelations = relations(clinicalCasesTable, ({ one }) => ({
  scale: one(ecoaScaleTable, {
    fields: [clinicalCasesTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
}));

export type ClinicalCases = InferSelectModel<typeof clinicalCasesTable>;