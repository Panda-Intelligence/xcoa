import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { BlogPostCard } from '@/components/blog/blog-post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Folder } from 'lucide-react';
import { Metadata } from 'next';
import { getSessionFromCookie } from '@/utils/auth';
import { db } from '@/db';
import { blogPostsTable } from '@/db/schemas/blog';
import { userTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { estimateReadingTime } from '@/lib/markdown';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const decodedCategory = decodeURIComponent(params.category);

  return {
    title: `${decodedCategory} - Blog Category`,
    description: `Browse all blog posts in the ${decodedCategory} category`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect('/sign-in');
  }

  const decodedCategory = decodeURIComponent(params.category);

  // Fetch posts by category
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
        eq(blogPostsTable.category, decodedCategory),
        eq(blogPostsTable.status, 'published')
      )
    )
    .orderBy(desc(blogPostsTable.publishedAt))
    .limit(50);

  // Calculate reading time for each post
  const posts = postsResult.map((post) => ({
    ...post,
    readingTime: post.content ? estimateReadingTime(post.content) : 0,
    tags: (post.tags as string[]) || [],
  }));

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: '/blog', label: 'blog.title' },
          { href: `/blog/category/${params.category}`, label: decodedCategory },
        ]}
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Category Header */}
          <div className="border-b pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Folder className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">{decodedCategory}</h1>
              <Badge variant="secondary">{posts.length} posts</Badge>
            </div>
            <p className="text-muted-foreground">
              Browse all posts in the {decodedCategory} category
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No posts in this category</h3>
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
