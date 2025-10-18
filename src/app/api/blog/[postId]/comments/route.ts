import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { blogCommentsTable, blogPostsTable } from '@/db/schemas/blog';
import { userTable } from '@/db/schema';
import { eq, and, sql, desc, isNull } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';
import { parseMarkdown, validateMarkdown } from '@/lib/markdown';
import { createId } from '@paralleldrive/cuid2';

/**
 * Comment creation schema
 */
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment too long'),
  parentId: z.string().optional(),
});

/**
 * Query parameters schema for comments listing
 */
const commentsQuerySchema = z.object({
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
  parentId: z.string().optional(),
  status: z.string().optional().default('published'),
});

/**
 * GET /api/blog/[postId]/comments
 * Retrieve comments for a blog post with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const parentId = url.searchParams.get('parentId') || null;
    const status = url.searchParams.get('status') || 'published';

    const db = getDB();

    // Verify post exists
    const post = await db
      .select({ id: blogPostsTable.id })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, postId))
      .limit(1);

    if (!post || post.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Build comments query
    const conditions = [
      eq(blogCommentsTable.postId, postId),
      eq(blogCommentsTable.status, status),
    ];

    // Filter by parentId (null for top-level comments)
    if (parentId) {
      conditions.push(eq(blogCommentsTable.parentId, parentId));
    } else {
      conditions.push(isNull(blogCommentsTable.parentId));
    }

    // Fetch comments with user information
    const comments = await db
      .select({
        id: blogCommentsTable.id,
        postId: blogCommentsTable.postId,
        content: blogCommentsTable.content,
        contentHtml: blogCommentsTable.contentHtml,
        parentId: blogCommentsTable.parentId,
        status: blogCommentsTable.status,
        likeCount: blogCommentsTable.likeCount,
        isEdited: blogCommentsTable.isEdited,
        editedAt: blogCommentsTable.editedAt,
        createdAt: blogCommentsTable.createdAt,
        updatedAt: blogCommentsTable.updatedAt,
        // User information
        userId: userTable.id,
        userName: userTable.name,
        userEmail: userTable.email,
        userAvatar: userTable.avatar,
        // Reply count (subquery)
        replyCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${blogCommentsTable} AS replies
          WHERE replies.parent_id = ${blogCommentsTable.id}
          AND replies.status = 'published'
        )`,
      })
      .from(blogCommentsTable)
      .leftJoin(userTable, eq(blogCommentsTable.userId, userTable.id))
      .where(and(...conditions))
      .orderBy(desc(blogCommentsTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogCommentsTable)
      .where(and(...conditions));

    const totalCount = totalCountQuery[0]?.count || 0;

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: totalCount > offset + limit,
      },
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * Rate limiting cache (in-memory for simplicity, use Redis in production)
 */
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for comment creation
 * @param userId - User ID to check
 * @param maxComments - Maximum comments per hour (default: 5)
 * @returns true if rate limit exceeded
 */
function checkRateLimit(userId: string, maxComments: number = 5): boolean {
  const now = Date.now();
  const userLimit = rateLimitCache.get(userId);

  // Clean up expired entries
  if (userLimit && now > userLimit.resetAt) {
    rateLimitCache.delete(userId);
    return false;
  }

  // Check if limit exceeded
  if (userLimit && userLimit.count >= maxComments) {
    return true;
  }

  // Update or create limit entry
  if (userLimit) {
    userLimit.count += 1;
  } else {
    rateLimitCache.set(userId, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour
    });
  }

  return false;
}

/**
 * POST /api/blog/[postId]/comments
 * Create a new comment on a blog post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const body = await request.json();

    // Validate request body
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content, parentId } = validation.data;

    // Validate markdown content
    const contentValidation = validateMarkdown(content, 5000);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const db = getDB();

    // Verify post exists and is published
    const post = await db
      .select({ id: blogPostsTable.id, status: blogPostsTable.status })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, postId))
      .limit(1);

    if (!post || post.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post[0].status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot comment on unpublished post' },
        { status: 403 }
      );
    }

    // If parentId provided, verify parent comment exists
    if (parentId) {
      const parentComment = await db
        .select({ id: blogCommentsTable.id, postId: blogCommentsTable.postId })
        .from(blogCommentsTable)
        .where(eq(blogCommentsTable.id, parentId))
        .limit(1);

      if (!parentComment || parentComment.length === 0) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      // Verify parent comment belongs to same post
      if (parentComment[0].postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this post' },
          { status: 400 }
        );
      }
    }

    // Parse markdown to HTML
    const contentHtml = await parseMarkdown(content, {
      enableGfm: true,
      sanitize: true,
      enableSyntaxHighlighting: false, // Disable for comments
    });

    // Create comment
    const commentId = `comment_${createId()}`;
    await db.insert(blogCommentsTable).values({
      id: commentId,
      postId,
      userId: session.user.id,
      content,
      contentHtml,
      parentId: parentId || null,
      status: 'published', // Auto-publish (add moderation queue in production)
      likeCount: 0,
      isEdited: 0,
      editedAt: null,
    });

    // Increment post comment count
    await db
      .update(blogPostsTable)
      .set({
        commentCount: sql`${blogPostsTable.commentCount} + 1`,
      })
      .where(eq(blogPostsTable.id, postId));

    // Fetch created comment with user info
    const createdComment = await db
      .select({
        id: blogCommentsTable.id,
        postId: blogCommentsTable.postId,
        content: blogCommentsTable.content,
        contentHtml: blogCommentsTable.contentHtml,
        parentId: blogCommentsTable.parentId,
        status: blogCommentsTable.status,
        likeCount: blogCommentsTable.likeCount,
        createdAt: blogCommentsTable.createdAt,
        userId: userTable.id,
        userName: userTable.name,
        userAvatar: userTable.avatar,
      })
      .from(blogCommentsTable)
      .leftJoin(userTable, eq(blogCommentsTable.userId, userTable.id))
      .where(eq(blogCommentsTable.id, commentId))
      .limit(1);

    return NextResponse.json({
      success: true,
      comment: createdComment[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
