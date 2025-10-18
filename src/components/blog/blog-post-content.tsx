'use client';

interface BlogPostContentProps {
  contentHtml: string;
  className?: string;
}

export function BlogPostContent({ contentHtml, className = '' }: BlogPostContentProps) {
  return (
    <div
      className={`prose prose-slate max-w-none dark:prose-invert
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-p:text-base prose-p:leading-7
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-muted prose-pre:border prose-pre:border-border
        prose-img:rounded-lg prose-img:shadow-md
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:text-base prose-li:leading-7
        prose-table:w-full prose-table:border-collapse
        prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-border
        prose-td:p-2 prose-td:border prose-td:border-border
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
