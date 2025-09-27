import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { commonColumns } from "./shared";
import { createId } from "@paralleldrive/cuid2";
import { ecoaScaleTable } from "./scale";
import { userTable } from "./user";

// Copyright Holders/Publishers
export const copyrightHolderTable = sqliteTable("copyright_holder", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `copyright_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  nameEn: text({ length: 255 }),
  organizationType: text({ length: 100 }), // publisher, research_institution, individual, foundation
  website: text({ length: 500 }),
  description: text({ length: 1000 }),
  descriptionEn: text({ length: 1000 }),

  // Contact Information
  contactEmail: text({ length: 255 }),
  contactPhone: text({ length: 50 }),
  contactMobile: text({ length: 50 }),
  contactFax: text({ length: 50 }),
  contactAddress: text({ length: 500 }),

  // Business Information
  licenseTypes: text({ mode: 'json' }).$type<string[]>().default([]), // commercial, academic, research, free
  licenseRequirements: text({ length: 1000 }),
  pricingInfo: text({ length: 500 }),

  // Status
  isActive: integer().default(1),
  isVerified: integer().default(0),
}, (table) => ([
  index('copyright_holder_name_idx').on(table.name),
  index('copyright_holder_org_type_idx').on(table.organizationType),
  index('copyright_holder_active_idx').on(table.isActive),
]));

// Contact Requests from Users
export const copyrightContactRequestTable = sqliteTable("copyright_contact_request", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `contact_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  copyrightHolderId: text().notNull().references(() => copyrightHolderTable.id),

  // Request Information
  requestType: text({ length: 50 }).notNull(), // license_inquiry, usage_request, support, other
  intendedUse: text({ length: 500 }), // clinical, research, commercial, education
  organizationName: text({ length: 255 }),
  organizationType: text({ length: 100 }),

  // Contact Details
  contactName: text({ length: 255 }).notNull(),
  contactEmail: text({ length: 255 }).notNull(),
  contactPhone: text({ length: 50 }),
  message: text({ length: 2000 }),

  // Status Tracking
  status: text({ length: 50 }).default('pending'), // pending, sent, responded, completed, failed
  sentAt: integer({ mode: "timestamp" }),
  responseReceived: integer({ mode: "timestamp" }),
  adminNotes: text({ length: 1000 }),
}, (table) => ([
  index('copyright_contact_user_id_idx').on(table.userId),
  index('copyright_contact_scale_id_idx').on(table.scaleId),
  index('copyright_contact_holder_id_idx').on(table.copyrightHolderId),
  index('copyright_contact_status_idx').on(table.status),
  index('copyright_contact_created_at_idx').on(table.createdAt),
]));

// Relations
export const copyrightHolderRelations = relations(copyrightHolderTable, ({ many }) => ({
  scales: many(ecoaScaleTable),
  contactRequests: many(copyrightContactRequestTable),
}));

export const copyrightContactRequestRelations = relations(copyrightContactRequestTable, ({ one }) => ({
  user: one(userTable, {
    fields: [copyrightContactRequestTable.userId],
    references: [userTable.id],
  }),
  scale: one(ecoaScaleTable, {
    fields: [copyrightContactRequestTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
  copyrightHolder: one(copyrightHolderTable, {
    fields: [copyrightContactRequestTable.copyrightHolderId],
    references: [copyrightHolderTable.id],
  }),
}));


// 版权许可详细信息表
export const copyrightLicensesTable = sqliteTable("copyright_licenses", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `license_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  licenseType: text({ length: 50 }), // public_domain, academic_free, commercial_paid
  copyrightHolder: text({ length: 255 }),
  contactEmail: text({ length: 255 }),
  contactPhone: text({ length: 50 }),
  website: text({ length: 500 }),
  licenseTerms: text({ length: 2000 }),
  commercialCost: text({ length: 255 }),
  academicCost: text({ length: 255 }),
  usageRestrictions: text({ length: 1000 }),
  applicationProcess: text({ length: 1000 }),
  responseTime: text({ length: 100 }),
}, (table) => ([
  index('copyright_licenses_scale_id_idx').on(table.scaleId),
  index('copyright_licenses_type_idx').on(table.licenseType),
]));
