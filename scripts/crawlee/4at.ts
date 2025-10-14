import { CheerioCrawler, log, LogLevel } from 'crawlee';

// Crawl the 4AT download page and extract downloadable links with context.
// Output is written to Crawlee dataset (./storage/datasets/default by default).

log.setLevel(LogLevel.INFO);

type DownloadRecord = {
  page: string;
  pageTitle?: string;
  section?: string | null;
  anchorText: string;
  href: string;
  isPdf: boolean;
  language?: string | null;
};

// Very lightweight language inference from text
function inferLanguage(text: string): string | null {
  const t = text.toLowerCase();
  const dict: [string, RegExp][] = [
    ['English', /english|eng\b/],
    ['Chinese (Simplified)', /simplified|简体|中文|chinese/],
    ['Chinese (Traditional)', /traditional|繁體/],
    ['Arabic', /arabic|العربية/],
    ['French', /french|français/],
    ['German', /german|deutsch/],
    ['Spanish', /spanish|español/],
    ['Italian', /italian|italiano/],
    ['Portuguese', /portuguese|português/],
    ['Japanese', /japanese|日本語/],
    ['Korean', /korean|한국어/],
    ['Russian', /russian|русский/],
    ['Turkish', /turkish|türkçe/],
    ['Dutch', /dutch|nederlands/],
    ['Polish', /polish|polski/],
  ];
  for (const [name, re] of dict) if (re.test(t)) return name;
  return null;
}

const START_URL = 'https://www.the4at.com/4at-download';

const crawler = new CheerioCrawler({
  requestHandler: async ({ request, $, pushData }) => {
    const pageTitle = $('h1, .entry-title').first().text().trim();

    // Collect all anchors with href (exclude in-page anchors, mailto, javascript)
    const out: DownloadRecord[] = [];
    $('a[href]').each((_, el) => {
      const $a = $(el);
      const rawHref = ($a.attr('href') || '').trim();
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('javascript:')) return;

      // Resolve relative URLs against the page URL
      let href: string;
      try {
        href = new URL(rawHref, request.loadedUrl || request.url).toString();
      } catch {
        return;
      }

      // Only keep same-site links and PDFs from the site (adjust if needed)
      const isPdf = /\.pdf(\?|#|$)/i.test(href);
      const isSameSite = href.startsWith('https://www.the4at.com/');
      if (!isSameSite && !isPdf) return;

      const anchorText = $a.text().trim() || $a.attr('title') || '';

      // Find nearest contextual heading (h2/h3) for section info
      let section: string | null = null;
      const parent = $a.closest('section, article, .entry-content, .wp-block-group');
      const inParentHeading = parent.find('h2, h3').first().text().trim();
      if (inParentHeading) section = inParentHeading;
      if (!section) {
        const prevHeading = $a.parents().find('h2, h3').first().text().trim();
        if (prevHeading) section = prevHeading;
      }

      // Try to infer language from anchor or section text
      const language = inferLanguage(`${anchorText} ${section ?? ''}`) || null;

      out.push({
        page: request.url,
        pageTitle,
        section,
        anchorText,
        href,
        isPdf,
        language,
      });
    });

    // De-duplicate by href + anchorText
    const dedup = new Map<string, DownloadRecord>();
    for (const rec of out) {
      dedup.set(`${rec.href}::${rec.anchorText}`, rec);
    }
    for (const rec of dedup.values()) await pushData(rec);
  },

  failedRequestHandler: ({ request }) => {
    log.warning(`Failed to process: ${request.url}`);
  },
});

await crawler.run([START_URL]);

