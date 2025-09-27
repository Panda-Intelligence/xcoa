import { sqliteTable, integer, real, text, index } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, relations } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'
import { commonColumns } from './shared';
import { userTable } from "./user";

import { ecoaScaleTable } from "./scale";

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
