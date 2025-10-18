import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { BlogPostCard } from '@/components/blog/blog-post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Tag } from 'lucide-react';
import { Metadata } from 'next';
import { getSessionFromCookie } from '@/utils/auth';
import { db } from '@/db';
import { blogPostsTable } from '@/db/schemas/blog';
import { userTable } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { estimateReadingTime } from '@/lib/markdown';

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag);

  return {
    title: `#${decodedTag} - Blog Tag`,
    description: `Browse all blog posts tagged with ${decodedTag}`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect('/sign-in');
  }

  const decodedTag = decodeURIComponent(params.tag);

  // Fetch posts by tag (using JSON_CONTAINS or similar for tags array)
  // Note: Drizzle ORM may not have direct JSON_CONTAINS, so we filter in memory
  const postsResult = await db
    .select({
      id: blogPostsTable.id,
      title: blogPostsTable.title,
      slug: blogPostsTable.slug,
      content: blogPostsTable.content,
      excerpt: blogPostsTable.excerpt,
      category: blogPostsTable.category,
      tags: blogPostsTable.tags,
      publishedAt: blogPostsTable.publishedAt,
      viewCount: blogPostsTable.viewCount,
      likeCount: blogPostsTable.likeCount,
      commentCount: blogPostsTable.commentCount,
      authorId: blogPostsTable.authorId,
      authorName: userTable.fullName,
    })
    .from(blogPostsTable)
    .leftJoin(userTable, eq(blogPostsTable.authorId, userTable.id))
    .where(
      and(
        eq(blogPostsTable.status, 'published'),
        sql`json_array_contains(${blogPostsTable.tags}, ${decodedTag})`
      )
    )
    .orderBy(desc(blogPostsTable.publishedAt))
    .limit(50);

  // Calculate reading time and filter by tag in memory (fallback)
  const posts = postsResult
    .filter((post) => {
      const tags = post.tags as string[] | null;
      return tags && tags.includes(decodedTag);
    })
    .map((post) => ({
      ...post,
      readingTime: post.content ? estimateReadingTime(post.content) : 0,
      tags: (post.tags as string[]) || [],
    }));

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: '/blog', label: 'blog.title' },
          { href: `/blog/tag/${params.tag}`, label: `#${decodedTag}` },
        ]}
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Tag Header */}
          <div className="border-b pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Tag className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">#{decodedTag}</h1>
              <Badge variant="secondary">{posts.length} posts</Badge>
            </div>
            <p className="text-muted-foreground">
              Browse all posts tagged with {decodedTag}
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No posts with this tag</h3>
                <p className="text-muted-foreground">
                  Check back later for new content
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
