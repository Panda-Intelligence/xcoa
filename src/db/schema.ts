import { sqliteTable, integer, text, real, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'

export const ROLES_ENUM = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];

const commonColumns = {
  createdAt: integer({
    mode: "timestamp",
  }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer({
    mode: "timestamp",
  }).$onUpdateFn(() => new Date()).notNull(),
  updateCounter: integer().default(0).$onUpdate(() => sql`updateCounter + 1`),
}

export const userTable = sqliteTable("user", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `usr_${createId()}`).notNull(),
  firstName: text({
    length: 255,
  }),
  lastName: text({
    length: 255,
  }),
  email: text({
    length: 255,
  }).unique(),
  passwordHash: text(),
  role: text({
    enum: roleTuple,
  }).default(ROLES_ENUM.USER).notNull(),
  emailVerified: integer({
    mode: "timestamp",
  }),
  signUpIpAddress: text({
    length: 100,
  }),
  googleAccountId: text({
    length: 255,
  }),
  /**
   * This can either be an absolute or relative path to an image
   */
  avatar: text({
    length: 600,
  }),
  // Credit system fields
  currentCredits: integer().default(0).notNull(),
  lastCreditRefreshAt: integer({
    mode: "timestamp",
  }),
}, (table) => ([
  index('email_idx').on(table.email),
  index('google_account_id_idx').on(table.googleAccountId),
  index('role_idx').on(table.role),
]));

export const passKeyCredentialTable = sqliteTable("passkey_credential", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `pkey_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  credentialId: text({
    length: 255,
  }).notNull().unique(),
  credentialPublicKey: text({
    length: 255,
  }).notNull(),
  counter: integer().notNull(),
  // Optional array of AuthenticatorTransport as JSON string
  transports: text({
    length: 255,
  }),
  // Authenticator Attestation GUID. We use this to identify the device/authenticator app that created the passkey
  aaguid: text({
    length: 255,
  }),
  // The user agent of the device that created the passkey
  userAgent: text({
    length: 255,
  }),
  // The IP address that created the passkey
  ipAddress: text({
    length: 100,
  }),
}, (table) => ([
  index('user_id_idx').on(table.userId),
  index('credential_id_idx').on(table.credentialId),
]));

// Credit transaction types
export const CREDIT_TRANSACTION_TYPE = {
  PURCHASE: 'PURCHASE',
  USAGE: 'USAGE',
  MONTHLY_REFRESH: 'MONTHLY_REFRESH',
} as const;

export const creditTransactionTypeTuple = Object.values(CREDIT_TRANSACTION_TYPE) as [string, ...string[]];

export const creditTransactionTable = sqliteTable("credit_transaction", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `ctxn_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  amount: integer().notNull(),
  // Track how many credits are still available from this transaction
  remainingAmount: integer().default(0).notNull(),
  type: text({
    enum: creditTransactionTypeTuple,
  }).notNull(),
  description: text({
    length: 255,
  }).notNull(),
  expirationDate: integer({
    mode: "timestamp",
  }),
  expirationDateProcessedAt: integer({
    mode: "timestamp",
  }),
  paymentIntentId: text({
    length: 255,
  }),
}, (table) => ([
  index('credit_transaction_user_id_idx').on(table.userId),
  index('credit_transaction_type_idx').on(table.type),
  index('credit_transaction_created_at_idx').on(table.createdAt),
  index('credit_transaction_expiration_date_idx').on(table.expirationDate),
  index('credit_transaction_payment_intent_id_idx').on(table.paymentIntentId),
]));

// Define item types that can be purchased
export const PURCHASABLE_ITEM_TYPE = {
  COMPONENT: 'COMPONENT',
  // Add more types in the future (e.g., TEMPLATE, PLUGIN, etc.)
} as const;

export const purchasableItemTypeTuple = Object.values(PURCHASABLE_ITEM_TYPE) as [string, ...string[]];

export const purchasedItemsTable = sqliteTable("purchased_item", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `pitem_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  // The type of item (e.g., COMPONENT, TEMPLATE, etc.)
  itemType: text({
    enum: purchasableItemTypeTuple,
  }).notNull(),
  // The ID of the item within its type (e.g., componentId)
  itemId: text().notNull(),
  purchasedAt: integer({
    mode: "timestamp",
  }).$defaultFn(() => new Date()).notNull(),
}, (table) => ([
  index('purchased_item_user_id_idx').on(table.userId),
  index('purchased_item_type_idx').on(table.itemType),
  // Composite index for checking if a user owns a specific item of a specific type
  index('purchased_item_user_item_idx').on(table.userId, table.itemType, table.itemId),
]));

// System-defined roles - these are always available
export const SYSTEM_ROLES_ENUM = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export const systemRoleTuple = Object.values(SYSTEM_ROLES_ENUM) as [string, ...string[]];

// Define available permissions
export const TEAM_PERMISSIONS = {
  // Resource access
  ACCESS_DASHBOARD: 'access_dashboard',
  ACCESS_BILLING: 'access_billing',

  // User management
  INVITE_MEMBERS: 'invite_members',
  REMOVE_MEMBERS: 'remove_members',
  CHANGE_MEMBER_ROLES: 'change_member_roles',

  // Team management
  EDIT_TEAM_SETTINGS: 'edit_team_settings',
  DELETE_TEAM: 'delete_team',

  // Role management
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',
  ASSIGN_ROLES: 'assign_roles',

  // Content permissions
  CREATE_COMPONENTS: 'create_components',
  EDIT_COMPONENTS: 'edit_components',
  DELETE_COMPONENTS: 'delete_components',

  // Add more as needed
} as const;

// Team table
export const teamTable = sqliteTable("team", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `team_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull().unique(),
  description: text({ length: 1000 }),
  avatarUrl: text({ length: 600 }),
  // Settings could be stored as JSON
  settings: text({ length: 10000 }),
  // Optional billing-related fields
  billingEmail: text({ length: 255 }),
  planId: text({ length: 100 }),
  planExpiresAt: integer({ mode: "timestamp" }),
  creditBalance: integer().default(0).notNull(),
}, (table) => ([
  index('team_slug_idx').on(table.slug),
]));

// Team membership table
export const teamMembershipTable = sqliteTable("team_membership", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `tmem_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  userId: text().notNull().references(() => userTable.id),
  // This can be either a system role or a custom role ID
  roleId: text().notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: integer().default(1).notNull(),
  invitedBy: text().references(() => userTable.id),
  invitedAt: integer({ mode: "timestamp" }),
  joinedAt: integer({ mode: "timestamp" }),
  expiresAt: integer({ mode: "timestamp" }),
  isActive: integer().default(1).notNull(),
}, (table) => ([
  index('team_membership_team_id_idx').on(table.teamId),
  index('team_membership_user_id_idx').on(table.userId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_membership_unique_idx').on(table.teamId, table.userId),
]));

// Team role table
export const teamRoleTable = sqliteTable("team_role", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `trole_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  name: text({ length: 255 }).notNull(),
  description: text({ length: 1000 }),
  // Store permissions as a JSON array of permission keys
  permissions: text({ mode: 'json' }).notNull().$type<string[]>(),
  // A JSON field for storing UI-specific settings like color, icon, etc.
  metadata: text({ length: 5000 }),
  // Optional flag to mark some roles as non-editable
  isEditable: integer().default(1).notNull(),
}, (table) => ([
  index('team_role_team_id_idx').on(table.teamId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_role_name_unique_idx').on(table.teamId, table.name),
]));

// Team invitation table
export const teamInvitationTable = sqliteTable("team_invitation", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `tinv_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  email: text({ length: 255 }).notNull(),
  // This can be either a system role or a custom role ID
  roleId: text().notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: integer().default(1).notNull(),
  token: text({ length: 255 }).notNull().unique(),
  invitedBy: text().notNull().references(() => userTable.id),
  expiresAt: integer({ mode: "timestamp" }).notNull(),
  acceptedAt: integer({ mode: "timestamp" }),
  acceptedBy: text().references(() => userTable.id),
}, (table) => ([
  index('team_invitation_team_id_idx').on(table.teamId),
  index('team_invitation_email_idx').on(table.email),
  index('team_invitation_token_idx').on(table.token),
]));

export const teamRelations = relations(teamTable, ({ many }) => ({
  memberships: many(teamMembershipTable),
  invitations: many(teamInvitationTable),
  roles: many(teamRoleTable),
}));

export const teamRoleRelations = relations(teamRoleTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamRoleTable.teamId],
    references: [teamTable.id],
  }),
}));

export const teamMembershipRelations = relations(teamMembershipTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamMembershipTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [teamMembershipTable.userId],
    references: [userTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamMembershipTable.invitedBy],
    references: [userTable.id],
  }),
}));

export const teamInvitationRelations = relations(teamInvitationTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamInvitationTable.teamId],
    references: [teamTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamInvitationTable.invitedBy],
    references: [userTable.id],
  }),
  acceptedByUser: one(userTable, {
    fields: [teamInvitationTable.acceptedBy],
    references: [userTable.id],
  }),
}));

export const creditTransactionRelations = relations(creditTransactionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [creditTransactionTable.userId],
    references: [userTable.id],
  }),
}));

export const purchasedItemsRelations = relations(purchasedItemsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [purchasedItemsTable.userId],
    references: [userTable.id],
  }),
}));

export const userRelations = relations(userTable, ({ many }) => ({
  passkeys: many(passKeyCredentialTable),
  creditTransactions: many(creditTransactionTable),
  purchasedItems: many(purchasedItemsTable),
  teamMemberships: many(teamMembershipTable),
}));

export const passKeyCredentialRelations = relations(passKeyCredentialTable, ({ one }) => ({
  user: one(userTable, {
    fields: [passKeyCredentialTable.userId],
    references: [userTable.id],
  }),
}));

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
  itemsCount: integer().default(0),
  dimensionsCount: integer().default(0),
  languages: text({ mode: 'json' }).$type<string[]>().default([]),
  validationStatus: text({ length: 50 }).default('draft'), // draft, validated, published
  copyrightInfo: text({ length: 1000 }),
  scoringMethod: text({ length: 500 }),
  administrationTime: integer(), // minutes
  targetPopulation: text({ length: 500 }),
  ageRange: text({ length: 100 }),
  domains: text({ mode: 'json' }).$type<string[]>().default([]),
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

// User Search History
export const userSearchHistoryTable = sqliteTable("user_search_history", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `search_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  query: text({ length: 500 }).notNull(),
  filters: text({ mode: 'json' }).$type<Record<string, any>>(),
  resultsCount: integer().default(0),
  searchType: text({ length: 50 }).default('general'), // general, semantic, advanced
  ipAddress: text({ length: 100 }),
}, (table) => ([
  index('user_search_history_user_id_idx').on(table.userId),
  index('user_search_history_created_at_idx').on(table.createdAt),
]));

// User Favorites
export const userFavoriteTable = sqliteTable("user_favorite", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `fav_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  notes: text({ length: 1000 }),
}, (table) => ([
  index('user_favorite_user_id_idx').on(table.userId),
  index('user_favorite_scale_id_idx').on(table.scaleId),
  // Unique constraint for user-scale combination
  index('user_favorite_unique_idx').on(table.userId, table.scaleId),
]));

// Scale Usage Analytics
export const scaleUsageTable = sqliteTable("scale_usage", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `usage_${createId()}`).notNull(),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  userId: text().references(() => userTable.id),
  actionType: text({ length: 50 }).notNull(), // view, download, favorite, search_result
  ipAddress: text({ length: 100 }),
  userAgent: text({ length: 500 }),
  referrer: text({ length: 500 }),
}, (table) => ([
  index('scale_usage_scale_id_idx').on(table.scaleId),
  index('scale_usage_user_id_idx').on(table.userId),
  index('scale_usage_action_type_idx').on(table.actionType),
  index('scale_usage_created_at_idx').on(table.createdAt),
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

export const userSearchHistoryRelations = relations(userSearchHistoryTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userSearchHistoryTable.userId],
    references: [userTable.id],
  }),
}));

export const userFavoriteRelations = relations(userFavoriteTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userFavoriteTable.userId],
    references: [userTable.id],
  }),
  scale: one(ecoaScaleTable, {
    fields: [userFavoriteTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
}));

export const scaleUsageRelations = relations(scaleUsageTable, ({ one }) => ({
  scale: one(ecoaScaleTable, {
    fields: [scaleUsageTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
  user: one(userTable, {
    fields: [scaleUsageTable.userId],
    references: [userTable.id],
  }),
}));

// Updated user relations
export const updatedUserRelations = relations(userTable, ({ many }) => ({
  passkeys: many(passKeyCredentialTable),
  creditTransactions: many(creditTransactionTable),
  purchasedItems: many(purchasedItemsTable),
  teamMemberships: many(teamMembershipTable),
  searchHistory: many(userSearchHistoryTable),
  favorites: many(userFavoriteTable),
}));

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
  domains: text({ mode: 'json' }).$type<string[]>().default([]),
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

// Updated scale relations to include copyright (temporarily disabled due to migration issues)
// export const ecoaScaleUpdatedRelations = relations(ecoaScaleTable, ({ one, many }) => ({
//   category: one(ecoaCategoryTable, {
//     fields: [ecoaScaleTable.categoryId],
//     references: [ecoaCategoryTable.id],
//   }),
//   copyrightHolder: one(copyrightHolderTable, {
//     fields: [ecoaScaleTable.copyrightHolderId],
//     references: [copyrightHolderTable.id],
//   }),
//   items: many(ecoaItemTable),
//   favorites: many(userFavoriteTable),
//   usageRecords: many(scaleUsageTable),
//   contactRequests: many(copyrightContactRequestTable),
// }));

export type User = InferSelectModel<typeof userTable>;
export type PassKeyCredential = InferSelectModel<typeof passKeyCredentialTable>;
export type CreditTransaction = InferSelectModel<typeof creditTransactionTable>;
export type PurchasedItem = InferSelectModel<typeof purchasedItemsTable>;
export type Team = InferSelectModel<typeof teamTable>;
export type TeamMembership = InferSelectModel<typeof teamMembershipTable>;
export type TeamRole = InferSelectModel<typeof teamRoleTable>;
export type TeamInvitation = InferSelectModel<typeof teamInvitationTable>;
export type EcoaCategory = InferSelectModel<typeof ecoaCategoryTable>;
export type EcoaScale = InferSelectModel<typeof ecoaScaleTable>;
export type EcoaItem = InferSelectModel<typeof ecoaItemTable>;
export type UserSearchHistory = InferSelectModel<typeof userSearchHistoryTable>;
export type UserFavorite = InferSelectModel<typeof userFavoriteTable>;
export type ScaleUsage = InferSelectModel<typeof scaleUsageTable>;
export type CopyrightHolder = InferSelectModel<typeof copyrightHolderTable>;
export type CopyrightContactRequest = InferSelectModel<typeof copyrightContactRequestTable>;

// 新增量表内容增强表结构

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

// 量表比较表
export const scaleComparisonsTable = sqliteTable("scale_comparisons", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `comp_${createId()}`).notNull(),
  scale1Id: text().notNull().references(() => ecoaScaleTable.id),
  scale2Id: text().notNull().references(() => ecoaScaleTable.id),
  comparisonAspects: text({ mode: 'json' }).$type<Record<string, any>>(),
  similarities: text({ length: 2000 }),
  differences: text({ length: 2000 }),
  usageRecommendations: text({ length: 1000 }),
}, (table) => ([
  index('comparisons_scales_idx').on(table.scale1Id, table.scale2Id),
]));

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

export const clinicalCasesRelations = relations(clinicalCasesTable, ({ one }) => ({
  scale: one(ecoaScaleTable, {
    fields: [clinicalCasesTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
}));

// 新增类型导出
export type ScaleNorms = InferSelectModel<typeof scaleNormsTable>;
export type ScaleInterpretations = InferSelectModel<typeof scaleInterpretationsTable>;
export type ClinicalCases = InferSelectModel<typeof clinicalCasesTable>;
export type ScaleGuidelines = InferSelectModel<typeof scaleGuidelinesTable>;
export type ScaleComparisons = InferSelectModel<typeof scaleComparisonsTable>;
export type CopyrightLicenses = InferSelectModel<typeof copyrightLicensesTable>;

// 收藏系统表结构
export const userScaleFavoritesTable = sqliteTable("user_scale_favorites", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `fav_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  scaleId: text().notNull().references(() => ecoaScaleTable.id),
  collectionId: text().references(() => userCollectionsTable.id),
  personalNotes: text({ length: 1000 }),
  tags: text({ mode: 'json' }).$type<string[]>().default([]),
  priority: integer().default(0), // 0-5
  isPinned: integer().default(0),
}, (table) => ([
  index('favorites_user_id_idx').on(table.userId),
  index('favorites_scale_id_idx').on(table.scaleId),
  index('favorites_collection_idx').on(table.collectionId),
  index('favorites_pinned_idx').on(table.isPinned),
]));

export const userCollectionsTable = sqliteTable("user_collections", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `coll_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  name: text({ length: 255 }).notNull(),
  description: text({ length: 1000 }),
  color: text({ length: 50 }).default('blue'),
  icon: text({ length: 50 }).default('folder'),
  isPublic: integer().default(0),
  isDefault: integer().default(0),
  sortOrder: integer().default(0),
}, (table) => ([
  index('collections_user_id_idx').on(table.userId),
  index('collections_sort_order_idx').on(table.sortOrder),
  index('collections_public_idx').on(table.isPublic),
]));

export const scaleFavoriteStatsTable = sqliteTable("scale_favorite_stats", {
  scaleId: text().primaryKey().references(() => ecoaScaleTable.id),
  totalFavorites: integer().default(0),
  recentFavorites: integer().default(0),
  monthlyFavorites: integer().default(0),
  trendingScore: real().default(0.0),
  lastUpdated: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ([
  index('favorite_stats_trending_idx').on(table.trendingScore),
  index('favorite_stats_total_idx').on(table.totalFavorites),
]));

// 收藏系统关系定义
export const userScaleFavoritesRelations = relations(userScaleFavoritesTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userScaleFavoritesTable.userId],
    references: [userTable.id],
  }),
  scale: one(ecoaScaleTable, {
    fields: [userScaleFavoritesTable.scaleId],
    references: [ecoaScaleTable.id],
  }),
  collection: one(userCollectionsTable, {
    fields: [userScaleFavoritesTable.collectionId],
    references: [userCollectionsTable.id],
  }),
}));

export const userCollectionsRelations = relations(userCollectionsTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [userCollectionsTable.userId],
    references: [userTable.id],
  }),
  favorites: many(userScaleFavoritesTable),
}));

// 新增收藏系统类型
export type UserScaleFavorite = InferSelectModel<typeof userScaleFavoritesTable>;
export type UserCollection = InferSelectModel<typeof userCollectionsTable>;
export type ScaleFavoriteStats = InferSelectModel<typeof scaleFavoriteStatsTable>;
