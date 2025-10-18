import { notFound, redirect } from 'next/navigation';
import { BlogPostHeader } from '@/components/blog/blog-post-header';
import { BlogPostContent } from '@/components/blog/blog-post-content';
import { BlogCommentSection } from '@/components/blog/blog-comment-section';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ThumbsUp, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getSessionFromCookie } from '@/utils/auth';
import { db } from '@/db';
import { blogPostsTable } from '@/db/schemas/blog';
import { userTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { estimateReadingTime } from '@/lib/markdown';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await db
    .select({
      id: blogPostsTable.id,
      title: blogPostsTable.title,
      excerpt: blogPostsTable.excerpt,
      metaDescription: blogPostsTable.metaDescription,
      ogImage: blogPostsTable.ogImage,
      keywords: blogPostsTable.keywords,
    })
    .from(blogPostsTable)
    .where(
      and(
        eq(blogPostsTable.slug, params.slug),
        eq(blogPostsTable.status, 'published')
      )
    )
    .limit(1);

  if (!post[0]) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post[0].title,
    description: post[0].metaDescription || post[0].excerpt || '',
    keywords: post[0].keywords,
    openGraph: {
      title: post[0].title,
      description: post[0].metaDescription || post[0].excerpt || '',
      images: post[0].ogImage ? [{ url: post[0].ogImage }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post[0].title,
      description: post[0].metaDescription || post[0].excerpt || '',
      images: post[0].ogImage ? [post[0].ogImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect('/sign-in');
  }

  // Fetch blog post with author information
  const postResult = await db
    .select({
      id: blogPostsTable.id,
      title: blogPostsTable.title,
      slug: blogPostsTable.slug,
      content: blogPostsTable.content,
      contentHtml: blogPostsTable.contentHtml,
      excerpt: blogPostsTable.excerpt,
      category: blogPostsTable.category,
      tags: blogPostsTable.tags,
      publishedAt: blogPostsTable.publishedAt,
      viewCount: blogPostsTable.viewCount,
      likeCount: blogPostsTable.likeCount,
      commentCount: blogPostsTable.commentCount,
      authorId: blogPostsTable.authorId,
      authorName: userTable.fullName,
      authorAvatar: userTable.imageUrl,
    })
    .from(blogPostsTable)
    .leftJoin(userTable, eq(blogPostsTable.authorId, userTable.id))
    .where(
      and(
        eq(blogPostsTable.slug, params.slug),
        eq(blogPostsTable.status, 'published')
      )
    )
    .limit(1);

  if (!postResult[0]) {
    notFound();
  }

  const post = postResult[0];

  // Calculate reading time
  const readingTime = post.content ? estimateReadingTime(post.content) : 0;

  // Increment view count (fire and forget)
  db.update(blogPostsTable)
    .set({ viewCount: (post.viewCount || 0) + 1 })
    .where(eq(blogPostsTable.id, post.id))
    .execute()
    .catch(console.error);

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: '/blog', label: 'blog.title' },
          { href: `/blog/${post.slug}`, label: post.title },
        ]}
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Post Header */}
          <BlogPostHeader
            title={post.title}
            category={post.category || undefined}
            tags={(post.tags as string[]) || undefined}
            authorName={post.authorName || undefined}
            authorAvatar={post.authorAvatar || undefined}
            publishedAt={post.publishedAt || undefined}
            viewCount={post.viewCount || 0}
            likeCount={post.likeCount || 0}
            commentCount={post.commentCount || 0}
            readingTime={readingTime}
          />

          {/* Post Content */}
          <Card>
            <CardContent className="p-8">
              <BlogPostContent contentHtml={post.contentHtml || ''} />
            </CardContent>
          </Card>

          {/* Post Actions */}
          <div className="flex items-center justify-between border-t border-b py-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <ThumbsUp className="w-4 h-4" />
              <span>Like ({post.likeCount || 0})</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {/* Related Posts (Optional - Future Enhancement) */}
          {post.category && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Related Posts</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  More posts in{' '}
                  <Link href={`/blog/category/${post.category}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      {post.category}
                    </Badge>
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <BlogCommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
