import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { blogPostsTable, blogCommentsTable } from '@/db/schemas/blog';
import { userTable } from '@/db/schema';
import { eq, like, or, and, sql, desc, asc } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

/**
 * Query parameters schema for blog posts listing
 */
const postsQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  status: z.string().optional().default('published'),
  authorId: z.string().optional(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
  sortBy: z.enum(['publishedAt', 'viewCount', 'likeCount', 'commentCount']).optional().default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET /api/blog/posts
 * Retrieve blog posts with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const category = url.searchParams.get('category') || '';
    const tag = url.searchParams.get('tag') || '';
    const status = url.searchParams.get('status') || 'published';
    const authorId = url.searchParams.get('authorId') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const sortBy = (url.searchParams.get('sortBy') || 'publishedAt') as 'publishedAt' | 'viewCount' | 'likeCount' | 'commentCount';
    const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const db = getDB();

    // Build base query
    let queryBuilder = db
      .select({
        id: blogPostsTable.id,
        title: blogPostsTable.title,
        slug: blogPostsTable.slug,
        excerpt: blogPostsTable.excerpt,
        category: blogPostsTable.category,
        tags: blogPostsTable.tags,
        status: blogPostsTable.status,
        publishedAt: blogPostsTable.publishedAt,
        viewCount: blogPostsTable.viewCount,
        likeCount: blogPostsTable.likeCount,
        commentCount: blogPostsTable.commentCount,
        isPinned: blogPostsTable.isPinned,
        isFeatured: blogPostsTable.isFeatured,
        createdAt: blogPostsTable.createdAt,
        updatedAt: blogPostsTable.updatedAt,
        // Author information
        authorId: userTable.id,
        authorName: userTable.name,
        authorEmail: userTable.email,
        authorAvatar: userTable.avatar,
      })
      .from(blogPostsTable)
      .leftJoin(userTable, eq(blogPostsTable.authorId, userTable.id));

    // Apply filters
    const conditions = [];

    // Status filter
    conditions.push(eq(blogPostsTable.status, status));

    // Search query
    if (query) {
      conditions.push(
        or(
          like(blogPostsTable.title, `%${query}%`),
          like(blogPostsTable.excerpt, `%${query}%`),
          like(blogPostsTable.content, `%${query}%`)
        )
      );
    }

    // Category filter
    if (category) {
      conditions.push(eq(blogPostsTable.category, category));
    }

    // Tag filter (check if tag exists in JSON array)
    if (tag) {
      conditions.push(sql`json_each(${blogPostsTable.tags}) AND json_each.value = ${tag}`);
    }

    // Author filter
    if (authorId) {
      conditions.push(eq(blogPostsTable.authorId, authorId));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = blogPostsTable[sortBy];
    queryBuilder = queryBuilder.orderBy(
      sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)
    );

    // Apply pagination
    const posts = await queryBuilder.limit(limit).offset(offset);

    // Get total count for pagination
    const totalCountQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPostsTable)
      .where(and(...conditions));

    const totalCount = totalCountQuery[0]?.count || 0;

    // Get filter options from actual data
    const categoriesQuery = await db
      .selectDistinct({ category: blogPostsTable.category })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.status, 'published'));

    const categories = categoriesQuery
      .map(c => c.category)
      .filter(Boolean) as string[];

    // Get all unique tags
    const tagsQuery = await db
      .select({ tags: blogPostsTable.tags })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.status, 'published'));

    const allTags = new Set<string>();
    tagsQuery.forEach(row => {
      if (Array.isArray(row.tags)) {
        row.tags.forEach(tag => allTags.add(tag));
      }
    });

    // Get statistics
    const statsQuery = await db
      .select({
        totalPosts: sql<number>`count(*)`,
        totalViews: sql<number>`sum(${blogPostsTable.viewCount})`,
        totalLikes: sql<number>`sum(${blogPostsTable.likeCount})`,
        totalComments: sql<number>`sum(${blogPostsTable.commentCount})`,
      })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.status, 'published'));

    const statistics = {
      totalPosts: statsQuery[0]?.totalPosts || 0,
      totalViews: statsQuery[0]?.totalViews || 0,
      totalLikes: statsQuery[0]?.totalLikes || 0,
      totalComments: statsQuery[0]?.totalComments || 0,
    };

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: totalCount > offset + limit,
      },
      filterOptions: {
        categories,
        tags: Array.from(allTags),
      },
      statistics,
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
