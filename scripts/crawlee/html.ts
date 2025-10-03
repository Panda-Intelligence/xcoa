import { CheerioCrawler, log, LogLevel } from 'crawlee';

// Crawlers come with various utilities, e.g. for logging.
// Here we use debug level of logging to improve the debugging experience.
// This functionality is optional!
log.setLevel(LogLevel.DEBUG);

// Create an instance of the CheerioCrawler class - a crawler
// that automatically loads the URLs and parses their HTML using the cheerio library.
const crawler = new CheerioCrawler({
  // This function will be called for each URL to crawl.
  // It accepts a single parameter, which is an object with options as:
  // https://crawlee.dev/js/api/cheerio-crawler/interface/CheerioCrawlerOptions#requestHandler
  // We use for demonstration only 2 of them:
  // - request: an instance of the Request class with information such as the URL that is being crawled and HTTP method
  // - $: the cheerio object containing parsed HTML
  async requestHandler({ pushData, enqueueLinks, request, $ }) {
    log.debug(`Processing ${request.url}...`);

    // Extract data from the page using cheerio.
    // const title = $('title').text();
    const cnName = $('figure > table > tbody > tr:nth-child(1) > td:nth-child(2)').text();
    const enName = $('figure > table > tbody > tr:nth-child(2) > td:nth-child(2)').text();
    const abbrName = $('figure > table > tbody > tr:nth-child(3) > td:nth-child(2)').text();
    const author = $('figure > table > tbody > tr:nth-child(4) > td:nth-child(2)').text();
    const copyrightHolder = $('figure > table > tbody > tr:nth-child(5) > td:nth-child(2)').text();
    const allList = $('.wp-block-list')
    const target: { text: string }[] = []
    const domain: { text: string }[] = []
    $(allList[1]).find('li').each((index, el) => {
      target.push({
        text: $(el).text(),
      });
    });
    $(allList[2]).find('li').each((index, el) => {
      domain.push({
        text: $(el).text(),
      });
    });
    const languages: { text: string }[] = []
    $(allList[3]).find('li').each((index, el) => {
      languages.push({
        text: $(el).text(),
      });
    });
    const businessLicenseTypes: { text: string }[] = []
    $(allList[4]).find('li').each((index, el) => {
      businessLicenseTypes.push({
        text: $(el).text(),
      });
    });
    const assessmentTypes: { text: string }[] = []
    $(allList[5]).find('li').each((index, el) => {
      assessmentTypes.push({
        text: $(el).text(),
      });
    });

    const abstract = $($('div:nth-child(2) > p:nth-child(2)')[1]).text()
    // Store the results to the dataset. In local configuration,
    // the data will be stored as JSON files in ./storage/datasets/default
    await pushData({
      url: request.url,
      title: enName,
      cnName,
      enName,
      abstract,
      abbrName,
      author,
      copyrightHolder,
      target,
      domain,
      languages,
      businessLicenseTypes,
      assessmentTypes,
    });

    await enqueueLinks();
  },

  // This function is called if the page processing failed more than maxRequestRetries + 1 times.
  failedRequestHandler({ request }) {
    log.debug(`Request ${request.url} failed twice.`);
  },
});

// Run the crawler and wait for it to finish.
await crawler.run(['https://www.usecoa.com']);
