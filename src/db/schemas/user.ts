import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'
import { commonColumns } from './shared';

export const ROLES_ENUM = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];

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

// System-defined roles - these are always available
export const SYSTEM_ROLES_ENUM = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export const systemRoleTuple = Object.values(SYSTEM_ROLES_ENUM) as [string, ...string[]];


export const passKeyCredentialRelations = relations(passKeyCredentialTable, ({ one }) => ({
  user: one(userTable, {
    fields: [passKeyCredentialTable.userId],
    references: [userTable.id],
  }),
}));


// User Search History
export const userSearchHistoryTable = sqliteTable("user_search_history", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `search_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  query: text({ length: 500 }).notNull(),
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  filters: text({ mode: 'json' }).$type<Record<string, any>>(),
  resultsCount: integer().default(0),
  searchType: text({ length: 50 }).default('general'), // general, semantic, advanced
  ipAddress: text({ length: 100 }),
}, (table) => ([
  index('user_search_history_user_id_idx').on(table.userId),
  index('user_search_history_created_at_idx').on(table.createdAt),
]));

export const userSearchHistoryRelations = relations(userSearchHistoryTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userSearchHistoryTable.userId],
    references: [userTable.id],
  }),
}));
