import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import { commonColumns } from './shared';
import { userTable } from './user';

/**
 * 博客文章表
 * 存储技术博客、教程、新闻等内容
 */
export const blogPostsTable = sqliteTable("blog_posts", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `post_${createId()}`).notNull(),

  // 基本信息
  title: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull().unique(),
  excerpt: text({ length: 500 }),

  // 内容 - Markdown 和 HTML 双格式存储
  content: text({ length: 50000 }).notNull(),      // Markdown 原始内容
  contentHtml: text({ length: 50000 }),            // 解析后的 HTML

  // 分类和标签
  category: text({ length: 50 }).notNull(),        // 'tutorial' | 'news' | 'guide' | 'research'
  tags: text({ mode: 'json' }).$type<string[]>(), // ['typescript', 'react', 'database']

  // SEO 相关
  metaDescription: text({ length: 300 }),
  ogImage: text({ length: 500 }),                  // Open Graph 图片 URL
  keywords: text({ mode: 'json' }).$type<string[]>(), // SEO 关键词

  // 发布状态
  status: text({ length: 20 }).notNull().default('draft'), // 'draft' | 'published' | 'archived'
  publishedAt: integer({ mode: "timestamp" }),

  // 作者信息
  authorId: text().notNull().references(() => userTable.id),

  // 统计
  viewCount: integer().notNull().default(0),
  likeCount: integer().notNull().default(0),
  commentCount: integer().notNull().default(0),

  // 版本控制
  version: integer().notNull().default(1),

  // 置顶和推荐
  isPinned: integer().notNull().default(0),        // 是否置顶
  isFeatured: integer().notNull().default(0),      // 是否精选

}, (table) => ([
  index('blog_posts_slug_idx').on(table.slug),
  index('blog_posts_author_id_idx').on(table.authorId),
  index('blog_posts_status_idx').on(table.status),
  index('blog_posts_category_idx').on(table.category),
  index('blog_posts_published_at_idx').on(table.publishedAt),
]));

/**
 * 博客评论表
 * 支持嵌套评论（线程化讨论）
 */
export const blogCommentsTable = sqliteTable("blog_comments", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `comment_${createId()}`).notNull(),
  postId: text().notNull().references(() => blogPostsTable.id, { onDelete: 'cascade' }),

  // 评论者信息
  userId: text().notNull().references(() => userTable.id),

  // 评论内容 - 支持 Markdown
  content: text({ length: 5000 }).notNull(),       // Markdown 内容
  contentHtml: text({ length: 5000 }),             // 解析后的 HTML

  // 线程化评论支持
  parentId: text().references(() => blogCommentsTable.id, { onDelete: 'cascade' }), // 父评论 ID

  // 状态
  status: text({ length: 20 }).notNull().default('published'), // 'published' | 'pending' | 'spam' | 'deleted'

  // 统计
  likeCount: integer().notNull().default(0),

  // 审核相关
  isEdited: integer().notNull().default(0),
  editedAt: integer({ mode: "timestamp" }),

}, (table) => ([
  index('blog_comments_post_id_idx').on(table.postId),
  index('blog_comments_user_id_idx').on(table.userId),
  index('blog_comments_parent_id_idx').on(table.parentId),
  index('blog_comments_status_idx').on(table.status),
]));

/**
 * 博客文章版本历史表
 * 记录文章修改历史
 */
export const blogPostHistoryTable = sqliteTable("blog_post_history", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `phist_${createId()}`).notNull(),
  postId: text().notNull().references(() => blogPostsTable.id, { onDelete: 'cascade' }),

  version: integer().notNull(),

  // 变更内容
  title: text({ length: 255 }),
  content: text({ length: 50000 }),                // Markdown 内容快照
  contentHtml: text({ length: 50000 }),            // HTML 快照
  changeSummary: text({ length: 500 }),            // 变更摘要

  // 变更人
  changedBy: text().notNull().references(() => userTable.id),
  changeReason: text({ length: 1000 }),

}, (table) => ([
  index('blog_post_history_post_id_idx').on(table.postId),
  index('blog_post_history_version_idx').on(table.version),
]));

/**
 * 用户点赞记录表
 * 记录用户对文章和评论的点赞
 */
export const blogLikesTable = sqliteTable("blog_likes", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `like_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),

  // 可以点赞文章或评论
  postId: text().references(() => blogPostsTable.id, { onDelete: 'cascade' }),
  commentId: text().references(() => blogCommentsTable.id, { onDelete: 'cascade' }),

}, (table) => ([
  index('blog_likes_user_id_idx').on(table.userId),
  index('blog_likes_post_id_idx').on(table.postId),
  index('blog_likes_comment_id_idx').on(table.commentId),
  // Unique constraint: 每个用户只能对同一篇文章/评论点赞一次
  index('blog_likes_user_post_unique_idx').on(table.userId, table.postId),
  index('blog_likes_user_comment_unique_idx').on(table.userId, table.commentId),
]));

// Relations
export const blogPostsRelations = relations(blogPostsTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [blogPostsTable.authorId],
    references: [userTable.id],
  }),
  comments: many(blogCommentsTable),
  history: many(blogPostHistoryTable),
  likes: many(blogLikesTable),
}));

export const blogCommentsRelations = relations(blogCommentsTable, ({ one, many }) => ({
  post: one(blogPostsTable, {
    fields: [blogCommentsTable.postId],
    references: [blogPostsTable.id],
  }),
  user: one(userTable, {
    fields: [blogCommentsTable.userId],
    references: [userTable.id],
  }),
  parent: one(blogCommentsTable, {
    fields: [blogCommentsTable.parentId],
    references: [blogCommentsTable.id],
    relationName: 'comment_replies',
  }),
  replies: many(blogCommentsTable, {
    relationName: 'comment_replies',
  }),
  likes: many(blogLikesTable),
}));

export const blogPostHistoryRelations = relations(blogPostHistoryTable, ({ one }) => ({
  post: one(blogPostsTable, {
    fields: [blogPostHistoryTable.postId],
    references: [blogPostsTable.id],
  }),
  changer: one(userTable, {
    fields: [blogPostHistoryTable.changedBy],
    references: [userTable.id],
  }),
}));

export const blogLikesRelations = relations(blogLikesTable, ({ one }) => ({
  user: one(userTable, {
    fields: [blogLikesTable.userId],
    references: [userTable.id],
  }),
  post: one(blogPostsTable, {
    fields: [blogLikesTable.postId],
    references: [blogPostsTable.id],
  }),
  comment: one(blogCommentsTable, {
    fields: [blogLikesTable.commentId],
    references: [blogCommentsTable.id],
  }),
}));
