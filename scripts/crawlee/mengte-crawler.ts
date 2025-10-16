import { CheerioCrawler, ProxyConfiguration } from 'crawlee';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface MengteScale {
  id: string;
  url: string;
  cnName: string;
  enName: string;
  abbrName: string;
  category: string;
  description: string;
  usage: string;
}

const scales: MengteScale[] = [];
const baseUrl = 'https://mengte.online';

const crawler = new CheerioCrawler({
  maxRequestsPerCrawl: 2000,
  maxConcurrency: 3,
  requestHandlerTimeoutSecs: 60,

  async requestHandler({ request, $, enqueueLinks, log }) {
    const { url } = request;
    log.info(`Processing: ${url}`);

    if (url.includes('/medical_scales/')) {
      const scaleId = url.match(/\/medical_scales\/(\d+)/)?.[1];
      if (!scaleId) return;

      const cnName = $('h1.scale-title, .article-title, h1').first().text().trim();

      let enName = '';
      let abbrName = '';
      const match = cnName.match(/(.+?)（(.+?)）/);
      if (match) {
        enName = match[2];
        abbrName = cnName;
      } else {
        enName = cnName;
        abbrName = '';
      }

      const category = $('.breadcrumb a').last().text().trim() || '未分类';

      const description = $('.scale-description, .article-content p').first().text().trim() ||
                         $('p').first().text().trim() ||
                         '暂无描述';

      const usage = $('.scale-usage, .scale-application').text().trim() || '';

      if (cnName && cnName.length > 3) {
        scales.push({
          id: scaleId,
          url,
          cnName,
          enName,
          abbrName,
          category,
          description: description.substring(0, 500),
          usage: usage.substring(0, 300),
        });

        log.info(`✅ Extracted: ${cnName}`);
      }
    }

    if (url.includes('/medical_scales') || url.includes('/ms_category/')) {
      await enqueueLinks({
        selector: 'a[href*="/medical_scales/"], a[href*="/ms_category/"]',
        baseUrl,
      });

      await enqueueLinks({
        selector: 'a.page-link, a.pagination-link, a[href*="/page/"]',
        baseUrl,
      });
    }
  },

  failedRequestHandler({ request, log }) {
    log.error(`Request ${request.url} failed`);
  },
});

const startUrls = [
  'https://mengte.online/medical_scales',
  'https://mengte.online/ms_category/hxxt',
  'https://mengte.online/ms_category/jrggyjdzz',
  'https://mengte.online/ms_category/mnszxt',
  'https://mengte.online/ms_category/nfmyyhdxxt',
  'https://mengte.online/ms_category/other',
  'https://mengte.online/ms_category/sjjsl',
  'https://mengte.online/ms_category/wfe',
  'https://mengte.online/ms_category/wgypf',
  'https://mengte.online/ms_category/xhxt',
  'https://mengte.online/ms_category/xyjxhxt',
  'https://mengte.online/ms_category/zlyttgl',
];

console.log('🚀 Starting Mengte.online crawler...\n');
console.log('Target URLs:');
startUrls.forEach(url => console.log(`  - ${url}`));
console.log('');

await crawler.run(startUrls);

console.log(`\n✅ Crawling completed!`);
console.log(`📊 Total scales extracted: ${scales.length}`);

if (scales.length > 0) {
  const outputFile = join(process.cwd(), 'storage/mengte-scales.json');
  await writeFile(outputFile, JSON.stringify(scales, null, 2), 'utf-8');
  console.log(`💾 Data saved to: ${outputFile}`);

  console.log('\n📝 Sample scales (first 10):');
  scales.slice(0, 10).forEach((scale, i) => {
    console.log(`  ${i + 1}. [${scale.id}] ${scale.cnName}`);
  });

  console.log('\n✨ Next steps:');
  console.log('  1. Review the data in storage/mengte-scales.json');
  console.log('  2. Run: pnpm tsx scripts/crawlee/generate-mengte-sql.ts');
  console.log('  3. Import SQL to database');
} else {
  console.log('\n⚠️  No scales extracted. Check the website structure.');
}
