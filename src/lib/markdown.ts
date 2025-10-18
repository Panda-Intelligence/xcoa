import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeSanitize from 'rehype-sanitize';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';

/**
 * Options for markdown parsing
 */
export interface MarkdownOptions {
  /**
   * Enable GitHub Flavored Markdown (tables, task lists, strikethrough)
   * @default true
   */
  enableGfm?: boolean;

  /**
   * Enable syntax highlighting for code blocks
   * @default true
   */
  enableSyntaxHighlighting?: boolean;

  /**
   * Sanitize HTML output to prevent XSS attacks
   * @default true
   */
  sanitize?: boolean;

  /**
   * Allow custom HTML tags in markdown
   * @default false
   */
  allowHtml?: boolean;
}

/**
 * Parse markdown content to HTML
 *
 * @param markdown - Raw markdown content
 * @param options - Parsing options
 * @returns Parsed and sanitized HTML string
 *
 * @example
 * ```typescript
 * const html = await parseMarkdown('# Hello\n\nThis is **bold** text.');
 * // Returns: '<h1>Hello</h1><p>This is <strong>bold</strong> text.</p>'
 * ```
 */
export async function parseMarkdown(
  markdown: string,
  options: MarkdownOptions = {}
): Promise<string> {
  const {
    enableGfm = true,
    enableSyntaxHighlighting = true,
    sanitize = true,
    allowHtml = false,
  } = options;

  try {
    // Build processing pipeline
    let processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: allowHtml });

    // Add syntax highlighting
    if (enableSyntaxHighlighting) {
      processor = processor.use(rehypePrismPlus, {
        ignoreMissing: true,
        showLineNumbers: false,
      });
    }

    // Sanitize HTML to prevent XSS
    if (sanitize) {
      processor = processor.use(rehypeSanitize);
    }

    // Convert to HTML string
    processor = processor.use(rehypeStringify);

    // Process markdown
    const result = await processor.process(markdown);
    return String(result);
  } catch (error) {
    console.error('Markdown parsing error:', error);
    throw new Error('Failed to parse markdown content');
  }
}

/**
 * Generate URL-friendly slug from title
 *
 * @param title - Blog post title
 * @returns URL-friendly slug
 *
 * @example
 * ```typescript
 * generateSlug('Getting Started with TypeScript');
 * // Returns: 'getting-started-with-typescript'
 * ```
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace Chinese characters and spaces with hyphens
    .replace(/[\s\u4e00-\u9fa5]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract plain text excerpt from markdown
 *
 * @param markdown - Raw markdown content
 * @param maxLength - Maximum length of excerpt
 * @returns Plain text excerpt
 *
 * @example
 * ```typescript
 * extractExcerpt('# Hello\n\nThis is a **long** article...', 50);
 * // Returns: 'Hello This is a long article...'
 * ```
 */
export function extractExcerpt(markdown: string, maxLength: number = 200): string {
  // Remove markdown syntax
  const plainText = markdown
    // Remove headers
    .replace(/#{1,6}\s+/g, '')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Truncate to maxLength
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find last complete word within maxLength
  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Estimate reading time in minutes
 *
 * @param markdown - Raw markdown content
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Estimated reading time in minutes
 *
 * @example
 * ```typescript
 * estimateReadingTime('# Hello\n\nThis is content...');
 * // Returns: 1 (minute)
 * ```
 */
export function estimateReadingTime(
  markdown: string,
  wordsPerMinute: number = 200
): number {
  // Remove code blocks (code is read slower)
  const textWithoutCode = markdown.replace(/```[\s\S]*?```/g, '');

  // Count words (handle both English and Chinese)
  const englishWords = textWithoutCode.match(/\b\w+\b/g)?.length || 0;
  const chineseChars = textWithoutCode.match(/[\u4e00-\u9fa5]/g)?.length || 0;

  // Chinese characters count as 1 word per 2 characters
  const totalWords = englishWords + Math.ceil(chineseChars / 2);

  // Calculate reading time (minimum 1 minute)
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
}

/**
 * Validate markdown content
 *
 * @param markdown - Raw markdown content
 * @param maxLength - Maximum allowed length
 * @returns Validation result
 */
export function validateMarkdown(
  markdown: string,
  maxLength: number = 50000
): { valid: boolean; error?: string } {
  if (!markdown || markdown.trim().length === 0) {
    return { valid: false, error: 'Markdown content cannot be empty' };
  }

  if (markdown.length > maxLength) {
    return {
      valid: false,
      error: `Markdown content exceeds maximum length of ${maxLength} characters`,
    };
  }

  return { valid: true };
}
