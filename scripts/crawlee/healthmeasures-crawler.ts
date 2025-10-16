import { PlaywrightCrawler } from 'crawlee';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface HealthMeasuresScale {
  id: string;
  url: string;
  name: string;
  nameEn: string;
  acronym: string;
  domain: string;
  subdomain: string | null;
  itemsCount: number | null;
  description: string | null;
  scoringMethod: string | null;
  administrationTime: string | null;
  validationStatus: string | null;
  copyrightInfo: string | null;
  measurementSystem: string;
  measureType: string;
  language: string;
}

const scales: HealthMeasuresScale[] = [];
const baseUrl = 'https://www.healthmeasures.net';

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 500,
  maxConcurrency: 3,
  requestHandlerTimeoutSecs: 60,

  async requestHandler({ request, page, log }) {
    const { url } = request;
    log.info(`Processing: ${url}`);

    try {
      // Wait for table to load
      await page.waitForSelector('table tbody tr', { timeout: 30000 });

      // Try to increase page size to 50 items per page for efficiency
      try {
        const pageSelect = await page.$('select[visible]');
        if (pageSelect && await pageSelect.isVisible()) {
          await page.selectOption('select', '50');
          await page.waitForLoadState('networkidle', { timeout: 30000 });
          log.info('Set page size to 50 items');
        } else {
          log.info('Page size selector not visible, using default page size');
        }
      } catch (error) {
        log.info('Could not change page size, continuing with default');
      }

      // Extract data from all visible rows
      const rows = await page.$$('tr[id^="main-item-row-"]');
      log.info(`Found ${rows.length} scale rows on current page`);

      for (const row of rows) {
        try {
          const idAttr = await row.getAttribute('id');
          const instrumentId = idAttr?.match(/\d+/)?.[0];

          if (!instrumentId) {
            log.warning(`Could not extract ID from row: ${idAttr}`);
            continue;
          }

          const cells = await row.$$('td');
          if (cells.length < 5) {
            log.warning(`Row ${instrumentId} has insufficient cells: ${cells.length}`);
            continue;
          }

          const nameEl = await cells[0].textContent();
          const domainEl = await cells[1].textContent();
          const systemEl = await cells[2].textContent();
          const typeEl = await cells[3].textContent();
          const languageEl = await cells[4].textContent();

          const name = nameEl?.trim() || '';
          const domain = domainEl?.trim() || '';
          const system = systemEl?.trim() || '';
          const type = typeEl?.trim() || '';
          const language = languageEl?.trim() || '';

          if (!name || name.length < 3) {
            log.warning(`Skipping row ${instrumentId} with invalid name: ${name}`);
            continue;
          }

          // Extract acronym from name if it contains abbreviation pattern
          let acronym = '';
          const acronymMatch = name.match(/\b([A-Z]{2,}[-\s]?[A-Z0-9]*)\b/);
          if (acronymMatch) {
            acronym = acronymMatch[1];
          }

          scales.push({
            id: instrumentId,
            url: baseUrl + '/search-view-measures',
            name: name,
            nameEn: name,
            acronym: acronym,
            domain: domain,
            subdomain: null,
            itemsCount: null,
            description: null,
            scoringMethod: null,
            administrationTime: null,
            validationStatus: null,
            copyrightInfo: 'Northwestern University',
            measurementSystem: system,
            measureType: type,
            language: language,
          });

          log.info(`Extracted: [${instrumentId}] ${name}`);
        } catch (error) {
          log.error(`Error processing row: ${error}`);
        }
      }

      // Check if there's a next page
      const nextButton = await page.$('ul li a[aria-label="Next"]');
      const isLastPage = await page.$('ul li:has-text("...")');

      if (nextButton && !isLastPage) {
        log.info('Navigating to next page...');
        await nextButton.click();
        await page.waitForLoadState('networkidle', { timeout: 30000 });

        // Re-enqueue current URL to process next page
        // This is a workaround for client-side pagination that doesn't change URL
        // We rely on Crawlee's deduplication and request handler to stop when no more data
      } else {
        log.info('Reached last page or no next button found');
      }
    } catch (error) {
      log.error(`Error in requestHandler: ${error}`);
    }
  },

  failedRequestHandler({ request, log }) {
    log.error(`Request ${request.url} failed`);
  },
});

const startUrls = [
  'https://www.healthmeasures.net/search-view-measures?task=Search.search',
];

console.log('Starting HealthMeasures.net crawler...\n');
console.log('Target URL:');
startUrls.forEach(url => console.log(`  - ${url}`));
console.log('\nNote: Using PlaywrightCrawler due to JavaScript-based pagination\n');

await crawler.run(startUrls);

console.log(`\nCrawling completed!`);
console.log(`Total scales extracted: ${scales.length}`);

if (scales.length > 0) {
  const outputFile = join(process.cwd(), 'storage/healthmeasures-scales.json');
  await writeFile(outputFile, JSON.stringify(scales, null, 2), 'utf-8');
  console.log(`Data saved to: ${outputFile}`);

  console.log('\nSample scales (first 10):');
  scales.slice(0, 10).forEach((scale, i) => {
    console.log(`  ${i + 1}. [${scale.id}] ${scale.name} (${scale.language})`);
  });

  console.log('\nStatistics:');
  const languages = new Set(scales.map(s => s.language));
  console.log(`  - Unique languages: ${languages.size}`);
  console.log(`  - Languages: ${Array.from(languages).join(', ')}`);

  const systems = new Set(scales.map(s => s.measurementSystem));
  console.log(`  - Measurement systems: ${systems.size}`);
  console.log(`  - Systems: ${Array.from(systems).join(', ')}`);

  console.log('\nNext steps:');
  console.log('  1. Review the data in storage/healthmeasures-scales.json');
  console.log('  2. Run: pnpm tsx scripts/crawlee/generate-healthmeasures-sql.ts');
  console.log('  3. Import SQL to database');
} else {
  console.log('\nNo scales extracted. Check the website structure or selectors.');
}
