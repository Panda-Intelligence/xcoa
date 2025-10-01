import { sqliteTable, integer, text, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'
import { commonColumns } from "./shared";
import { scaleUsageTable, userFavoriteTable } from "./favorite";
import { copyrightHolderTable } from "./copyright";

// License Types for Scales
export const LICENSE_TYPE = {
  PUBLIC_DOMAIN: 'public_domain',
  OPEN_SOURCE: 'open_source',
  ACADEMIC_FREE: 'academic_free',
  COMMERCIAL: 'commercial',
  RESTRICTED: 'restricted',
  CONTACT_REQUIRED: 'contact_required',
} as const;

export const licenseTypeTuple = Object.values(LICENSE_TYPE) as [string, ...string[]];

export const TREATMENT_AREA = {
  IMMUNOLOGY: 'immunology',
  RESPIRATORY: 'respiratory',
  DIGESTIVE: 'digestive',
  NEUROLOGY: 'neurology',
  ONCOLOGY: 'oncology',
  HEMATOLOGY: 'hematology',
  DERMATOLOGY: 'dermatology',
  GENERAL: 'general',
} as const;

export const treatmentAreaTuple = Object.values(TREATMENT_AREA) as [string, ...string[]];

// eCOA Categories
export const ecoaCategoryTable = sqliteTable("ecoa_category", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `cat_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  nameEn: text({ length: 255 }),
  description: text({ length: 1000 }),
  descriptionEn: text({ length: 1000 }),
  parentId: text().references(() => ecoaCategoryTable.id),
  sortOrder: integer().default(0),
}, (table) => ([
  index('ecoa_category_parent_id_idx').on(table.parentId),
  index('ecoa_category_sort_order_idx').on(table.sortOrder),
]));

// eCOA Scales
export const ecoaScaleTable = sqliteTable("ecoa_scale", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `scale_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  nameEn: text({ length: 255 }),
  acronym: text({ length: 50 }),
  description: text({ length: 2000 }),
  descriptionEn: text({ length: 2000 }),
  categoryId: text().references(() => ecoaCategoryTable.id),
  // Copyright and Licensing
  copyrightHolderId: text().references(() => copyrightHolderTable.id),
  licenseType: text({ enum: licenseTypeTuple }).default(LICENSE_TYPE.CONTACT_REQUIRED),
  copyrightYear: integer(),
  copyrightInfo: text({ length: 1000 }),
  licenseTerms: text({ length: 2000 }),
  usageRestrictions: text({ length: 1000 }),
  // Scale Information
  itemsCount: integer().default(0),
  dimensionsCount: integer().default(0),
  languages: text({ mode: 'json' }).$type<string[]>().default([]),
  validationStatus: text({ length: 50 }).default('draft'), // draft, validated, published
  scoringMethod: text({ length: 500 }),
  administrationTime: integer(), // minutes
  targetPopulation: text({ length: 500 }),
  ageRange: text({ length: 100 }),
  treatmentArea: text({ enum: treatmentAreaTuple }),
  domains: text({ mode: 'json' }).$type<string[]>().default([]),
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  psychometricProperties: text({ mode: 'json' }).$type<Record<string, any>>(),
  references: text({ mode: 'json' }).$type<string[]>().default([]),
  downloadUrl: text({ length: 500 }),
  isPublic: integer().default(1),
  usageCount: integer().default(0),
  favoriteCount: integer().default(0),
  // Vector search optimization
  searchVector: text({ length: 1536 }), // OpenAI embedding size
}, (table) => ([
  index('ecoa_scale_category_id_idx').on(table.categoryId),
  index('ecoa_scale_copyright_holder_idx').on(table.copyrightHolderId),
  index('ecoa_scale_validation_status_idx').on(table.validationStatus),
  index('ecoa_scale_usage_count_idx').on(table.usageCount),
  index('ecoa_scale_is_public_idx').on(table.isPublic),
  index('ecoa_scale_acronym_idx').on(table.acronym),
]));

// eCOA Scale Items/Questions
export const ecoaItemTable = sqliteTable("ecoa_item", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `item_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  itemNumber: integer().notNull(),
  question: text({ length: 1000 }).notNull(),
  questionEn: text({ length: 1000 }),
  dimension: text({ length: 255 }),
  responseType: text({ length: 50 }).notNull(), // likert, boolean, numeric, text
  responseOptions: text({ mode: 'json' }).$type<string[]>(),
  scoringInfo: text({ length: 500 }),
  isRequired: integer().default(1),
  sortOrder: integer().default(0),
}, (table) => ([
  index('ecoa_item_scale_id_idx').on(table.scaleId),
  index('ecoa_item_dimension_idx').on(table.dimension),
  index('ecoa_item_sort_order_idx').on(table.sortOrder),
]));


// Update eCOA Scale table to include copyright information
export const ecoaScaleUpdatedTable = sqliteTable("ecoa_scale", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `scale_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  nameEn: text({ length: 255 }),
  acronym: text({ length: 50 }),
  description: text({ length: 2000 }),
  descriptionEn: text({ length: 2000 }),
  categoryId: text().references(() => ecoaCategoryTable.id),

  // Copyright and Licensing
  copyrightHolderId: text().references(() => copyrightHolderTable.id),
  licenseType: text({ enum: licenseTypeTuple }).default(LICENSE_TYPE.CONTACT_REQUIRED),
  copyrightYear: integer(),
  copyrightInfo: text({ length: 1000 }),
  licenseTerms: text({ length: 2000 }),
  usageRestrictions: text({ length: 1000 }),

  // Scale Information
  itemsCount: integer().default(0),
  dimensionsCount: integer().default(0),
  languages: text({ mode: 'json' }).$type<string[]>().default([]),
  validationStatus: text({ length: 50 }).default('draft'),
  scoringMethod: text({ length: 500 }),
  administrationTime: integer(),
  targetPopulation: text({ length: 500 }),
  ageRange: text({ length: 100 }),
  treatmentArea: text({ enum: treatmentAreaTuple }),
  domains: text({ mode: 'json' }).$type<string[]>().default([]),
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  psychometricProperties: text({ mode: 'json' }).$type<Record<string, any>>(),
  references: text({ mode: 'json' }).$type<string[]>().default([]),

  // Download and Access
  downloadUrl: text({ length: 500 }),
  isPublic: integer().default(1),
  usageCount: integer().default(0),
  favoriteCount: integer().default(0),
  searchVector: text({ length: 1536 }),
}, (table) => ([
  index('ecoa_scale_copyright_holder_idx').on(table.copyrightHolderId),
  index('ecoa_scale_license_type_idx').on(table.licenseType),
  index('ecoa_scale_category_id_idx').on(table.categoryId),
  index('ecoa_scale_validation_status_idx').on(table.validationStatus),
  index('ecoa_scale_usage_count_idx').on(table.usageCount),
  index('ecoa_scale_is_public_idx').on(table.isPublic),
  index('ecoa_scale_acronym_idx').on(table.acronym),
]));


// Relations
export const ecoaCategoryRelations = relations(ecoaCategoryTable, ({ one, many }) => ({
  parent: one(ecoaCategoryTable, {
    fields: [ecoaCategoryTable.parentId],
    references: [ecoaCategoryTable.id],
  }),
  children: many(ecoaCategoryTable),
  scales: many(ecoaScaleTable),
}));

export const ecoaScaleRelations = relations(ecoaScaleTable, ({ one, many }) => ({
  category: one(ecoaCategoryTable, {
    fields: [ecoaScaleTable.categoryId],
    references: [ecoaCategoryTable.id],
  }),
  items: many(ecoaItemTable),
  favorites: many(userFavoriteTable),
  usageRecords: many(scaleUsageTable),
}));

export const ecoaItemRelations = relations(ecoaItemTable, ({ one }) => ({
  scale: one(ecoaScaleTable, {
    fields: [ecoaItemTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
}));
