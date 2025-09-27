import { sqliteTable, integer, text, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'
import { commonColumns } from "./shared";
import { teamTable } from "./team";
import { userTable } from "./user";

// Invoice table for billing management
export const invoiceTable = sqliteTable("invoice", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `inv_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  invoiceNumber: text({ length: 50 }).notNull().unique(),

  // Invoice details
  issueDate: integer({ mode: "timestamp" }).notNull(),
  dueDate: integer({ mode: "timestamp" }).notNull(),
  status: text({ length: 20 }).default('draft').notNull(), // draft, sent, paid, overdue, cancelled

  // Amounts
  subtotal: real().notNull(),
  taxAmount: real().default(0),
  totalAmount: real().notNull(),
  currency: text({ length: 10 }).default('USD').notNull(),

  // Customer information (snapshot at time of invoice creation)
  customerName: text({ length: 255 }).notNull(),
  customerEmail: text({ length: 255 }).notNull(),
  customerOrganization: text({ length: 255 }),
  customerAddress: text({ length: 1000 }),
  customerVatNumber: text({ length: 50 }),
  customerCountry: text({ length: 100 }),

  // Payment information
  paymentMethod: text({ length: 50 }),
  paidAt: integer({ mode: "timestamp" }),
  paymentReference: text({ length: 255 }),

  // Invoice content
  description: text({ length: 1000 }),
  items: text({ mode: 'json' }).$type<Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    serviceType: string;
  }>>(),

  // Notes and metadata
  notes: text({ length: 2000 }),
  internalNotes: text({ length: 2000 }),
}, (table) => ([
  index('invoice_team_id_idx').on(table.teamId),
  index('invoice_number_idx').on(table.invoiceNumber),
  index('invoice_status_idx').on(table.status),
  index('invoice_issue_date_idx').on(table.issueDate),
]));

// Invoice relations
export const invoiceRelations = relations(invoiceTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [invoiceTable.teamId],
    references: [teamTable.id],
  }),
}));

// Invoice type
export type Invoice = InferSelectModel<typeof invoiceTable>;


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
