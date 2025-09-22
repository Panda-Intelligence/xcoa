import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, pushData, log }) {
    const title = await page.title();
    log.info(`Title of ${request.loadedUrl} is '${title}'`);

    await pushData({ title, url: request.loadedUrl });
    await enqueueLinks();
  },

  // Uncomment this option to see the browser window.
  headless: false,
});

await crawler.run(['https://www.usecoa.com']);
