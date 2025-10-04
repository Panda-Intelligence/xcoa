import { relations, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import type { ecoaCategoryTable, ecoaItemTable, ecoaScaleTable } from "./schemas/scale";
import { passKeyCredentialTable, userSearchHistoryTable, userTable } from "./schemas/user";
import { creditTransactionTable, purchasedItemsTable } from "./schemas/billing";
import { type teamInvitationTable, teamMembershipTable, type teamRoleTable, type teamTable } from "./schemas/team";
import { type scaleUsageTable, userFavoriteTable } from "./schemas/favorite";
import type { copyrightContactRequestTable, copyrightHolderTable, copyrightLicensesTable } from "./schemas/copyright";

export * from './schemas/team'
export * from './schemas/user'
export * from './schemas/scale'
export * from './schemas/copyright'
export * from './schemas/billing'
export * from './schemas/case'
export * from './schemas/favorite'
export * from './schemas/guide'
export * from './schemas/interpretation'

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

export type CopyrightLicenses = InferSelectModel<typeof copyrightLicensesTable>;


// Updated user relations
export const updatedUserRelations = relations(userTable, ({ many }) => ({
  passkeys: many(passKeyCredentialTable),
  creditTransactions: many(creditTransactionTable),
  purchasedItems: many(purchasedItemsTable),
  teamMemberships: many(teamMembershipTable),
  searchHistory: many(userSearchHistoryTable),
  favorites: many(userFavoriteTable),
}));
