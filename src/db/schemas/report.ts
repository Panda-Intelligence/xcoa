import { sqliteTable, integer, text, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'
import { commonColumns } from "./shared";
import { userTable } from "./user";
import { ecoaScaleTable, ecoaItemTable } from "./scale";

// Report Status Enum
export const REPORT_STATUS = {
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const reportStatusTuple = Object.values(REPORT_STATUS) as [string, ...string[]];

// Report Type Enum
export const REPORT_TYPE = {
  TEXT: 'text',
  PDF: 'pdf',
  HTML: 'html',
} as const;

export const reportTypeTuple = Object.values(REPORT_TYPE) as [string, ...string[]];

// Template Type Enum
export const TEMPLATE_TYPE = {
  STANDARD: 'standard',
  DETAILED: 'detailed',
  SUMMARY: 'summary',
} as const;

export const templateTypeTuple = Object.values(TEMPLATE_TYPE) as [string, ...string[]];

// Scale Response Table - stores individual user responses to scale items
export const scaleResponseTable = sqliteTable("scale_response", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `resp_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  sessionId: text({ length: 255 }).notNull(), // Groups responses in a single assessment session
  itemId: text().notNull().references(() => ecoaItemTable.id),
  itemNumber: integer().notNull(), // Denormalized for easier querying
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  response: text({ mode: 'json' }).$type<any>(), // The actual answer (could be string, number, array)
  responseValue: real(), // Numeric value for scoring
  startedAt: integer({
    mode: "timestamp",
  }),
  completedAt: integer({
    mode: "timestamp",
  }),
  timeSpentSeconds: integer(), // Time spent on this item
  isSkipped: integer().default(0), // 0 = answered, 1 = skipped
  ipAddress: text({ length: 100 }),
}, (table) => ([
  index('scale_response_user_id_idx').on(table.userId),
  index('scale_response_scale_id_idx').on(table.scaleId),
  index('scale_response_session_id_idx').on(table.sessionId),
  index('scale_response_item_id_idx').on(table.itemId),
  index('scale_response_created_at_idx').on(table.createdAt),
]));

// Scale Report Table - stores generated assessment reports
export const scaleReportTable = sqliteTable("scale_report", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `report_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  sessionId: text({ length: 255 }).notNull(), // Links to scaleResponseTable sessions
  templateId: text().references(() => reportTemplateTable.id), // Optional template used
  reportType: text({ enum: reportTypeTuple }).default(REPORT_TYPE.PDF).notNull(),
  status: text({ enum: reportStatusTuple }).default(REPORT_STATUS.GENERATING).notNull(),

  // Scoring results
  totalScore: real(),
  maxScore: real(),
  completionRate: real(), // Percentage of items completed
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  dimensionScores: text({ mode: 'json' }).$type<Record<string, any>>(), // Scores by dimension

  // Interpretation and recommendations
  interpretation: text({ length: 5000 }), // Text interpretation of results
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  recommendations: text({ mode: 'json' }).$type<any[]>(), // Array of recommendation objects

  // Report content
  reportContent: text(), // Full report content (HTML or text)
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  chartData: text({ mode: 'json' }).$type<Record<string, any>>(), // Data for charts/visualizations

  // Metadata
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  metadata: text({ mode: 'json' }).$type<Record<string, any>>(), // Additional metadata
  generatedAt: integer({
    mode: "timestamp",
  }),
  expiresAt: integer({
    mode: "timestamp",
  }), // Optional expiration date

  // File storage
  downloadUrl: text({ length: 500 }), // S3/R2 URL for PDF/file download
  fileSize: integer(), // File size in bytes

  // Analytics
  viewCount: integer().default(0),
  downloadCount: integer().default(0),
  lastViewedAt: integer({
    mode: "timestamp",
  }),
}, (table) => ([
  index('scale_report_user_id_idx').on(table.userId),
  index('scale_report_scale_id_idx').on(table.scaleId),
  index('scale_report_session_id_idx').on(table.sessionId),
  index('scale_report_template_id_idx').on(table.templateId),
  index('scale_report_status_idx').on(table.status),
  index('scale_report_created_at_idx').on(table.createdAt),
  index('scale_report_generated_at_idx').on(table.generatedAt),
]));

// Report Template Table - stores report template configurations
export const reportTemplateTable = sqliteTable("report_template", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `tmpl_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  nameEn: text({ length: 255 }),
  scaleId: text().references(() => ecoaScaleTable.id), // Optional: for scale-specific templates
  description: text({ length: 1000 }),
  descriptionEn: text({ length: 1000 }),
  templateType: text({ enum: templateTypeTuple }).default(TEMPLATE_TYPE.STANDARD).notNull(),

  // Template structure
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  sections: text({ mode: 'json' }).$type<any[]>(), // Array of section definitions
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  styles: text({ mode: 'json' }).$type<Record<string, any>>(), // Styling configuration

  // Template settings
  includeCharts: integer().default(1), // Include visualization charts
  includeInterpretation: integer().default(1), // Include text interpretation
  includeRecommendations: integer().default(1), // Include recommendations
  includeDimensionScores: integer().default(1), // Include dimension breakdown

  // Status
  isDefault: integer().default(0), // Is this the default template for the scale
  isActive: integer().default(1), // Is this template active
  sortOrder: integer().default(0), // Display order

  // Usage statistics
  usageCount: integer().default(0),
}, (table) => ([
  index('report_template_scale_id_idx').on(table.scaleId),
  index('report_template_is_default_idx').on(table.isDefault),
  index('report_template_is_active_idx').on(table.isActive),
  index('report_template_sort_order_idx').on(table.sortOrder),
]));

// Relations
export const scaleResponseRelations = relations(scaleResponseTable, ({ one }) => ({
  user: one(userTable, {
    fields: [scaleResponseTable.userId],
    references: [userTable.id],
  }),
  scale: one(ecoaScaleTable, {
    fields: [scaleResponseTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
  item: one(ecoaItemTable, {
    fields: [scaleResponseTable.itemId],
    references: [ecoaItemTable.id],
  }),
}));

export const scaleReportRelations = relations(scaleReportTable, ({ one }) => ({
  user: one(userTable, {
    fields: [scaleReportTable.userId],
    references: [userTable.id],
  }),
  scale: one(ecoaScaleTable, {
    fields: [scaleReportTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
  template: one(reportTemplateTable, {
    fields: [scaleReportTable.templateId],
    references: [reportTemplateTable.id],
  }),
}));

export const reportTemplateRelations = relations(reportTemplateTable, ({ one, many }) => ({
  scale: one(ecoaScaleTable, {
    fields: [reportTemplateTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
  reports: many(scaleReportTable),
}));
