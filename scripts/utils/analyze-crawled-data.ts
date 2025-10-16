import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface CrawledData {
  url: string;
  title: string;
  cnName: string;
  enName: string;
  abstract: string;
  abbrName: string;
  author: string;
  copyrightHolder: string;
  target: Array<{ text: string }>;
  domain: Array<{ text: string }>;
  languages: Array<{ text: string }>;
  businessLicenseTypes: Array<{ text: string }>;
  assessmentTypes: Array<{ text: string }>;
}

interface AnalysisResult {
  totalFiles: number;
  validScales: number;
  invalidFiles: number;
  duplicates: number;
  alreadyImported: number;
  newScales: CrawledData[];
}

const datasetDir = join(process.cwd(), 'storage/datasets/default');
const existingSqlFile = join(process.cwd(), 'scripts/crawlee/insert-scales.sql');
const outputFile = join(process.cwd(), 'scripts/analysis-result.json');

async function analyzeData(): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    totalFiles: 0,
    validScales: 0,
    invalidFiles: 0,
    duplicates: 0,
    alreadyImported: 0,
    newScales: [],
  };

  const files = await readdir(datasetDir);
  result.totalFiles = files.length;

  const existingSql = await readFile(existingSqlFile, 'utf-8');
  const existingIds = new Set<string>();
  const idMatches = existingSql.matchAll(/'(\d+)',\s*\d+,\s*\d+,\s*0,/g);
  for (const match of idMatches) {
    existingIds.add(match[1]);
  }

  console.log(`📊 Found ${existingIds.size} existing scales in insert-scales.sql`);

  const seenUrls = new Map<string, CrawledData>();
  const seenNames = new Map<string, CrawledData>();

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    try {
      const filePath = join(datasetDir, file);
      const content = await readFile(filePath, 'utf-8');
      const data: CrawledData = JSON.parse(content);

      if (!isValidScale(data)) {
        result.invalidFiles++;
        continue;
      }

      const scaleId = extractScaleId(data.url);
      if (!scaleId) {
        result.invalidFiles++;
        continue;
      }

      if (existingIds.has(scaleId)) {
        result.alreadyImported++;
        continue;
      }

      if (seenUrls.has(data.url)) {
        result.duplicates++;
        continue;
      }

      if (seenNames.has(data.cnName)) {
        result.duplicates++;
        continue;
      }

      result.validScales++;
      seenUrls.set(data.url, data);
      seenNames.set(data.cnName, data);
      result.newScales.push(data);
    } catch (error) {
      result.invalidFiles++;
      console.error(`Error processing ${file}:`, error);
    }
  }

  return result;
}

function isValidScale(data: CrawledData): boolean {
  if (!data.url || !data.url.match(/\?p=\d+$/)) {
    return false;
  }

  if (!data.cnName || data.cnName.trim() === '') {
    return false;
  }

  if (!data.enName || data.enName.trim() === '') {
    return false;
  }

  if (!data.abbrName || data.abbrName.trim() === '') {
    return false;
  }

  return true;
}

function extractScaleId(url: string): string | null {
  const match = url.match(/\?p=(\d+)$/);
  return match ? match[1] : null;
}

async function main() {
  console.log('🔍 Analyzing crawled data...\n');

  const result = await analyzeData();

  console.log('\n📈 Analysis Results:');
  console.log('─'.repeat(50));
  console.log(`Total files:              ${result.totalFiles}`);
  console.log(`Valid scale pages:        ${result.validScales}`);
  console.log(`Invalid files:            ${result.invalidFiles}`);
  console.log(`Duplicates:               ${result.duplicates}`);
  console.log(`Already imported:         ${result.alreadyImported}`);
  console.log(`✨ New scales found:      ${result.newScales.length}`);
  console.log('─'.repeat(50));

  if (result.newScales.length > 0) {
    console.log('\n📝 Sample of new scales (first 10):');
    result.newScales.slice(0, 10).forEach((scale, i) => {
      const id = extractScaleId(scale.url);
      console.log(`  ${i + 1}. [${id}] ${scale.cnName} (${scale.abbrName})`);
    });

    console.log(`\n💾 Saving analysis results to: ${outputFile}`);
    await writeFile(outputFile, JSON.stringify(result, null, 2), 'utf-8');

    console.log('\n✅ Next steps:');
    console.log('  1. Review the analysis results in scripts/analysis-result.json');
    console.log('  2. Run: pnpm tsx scripts/utils/generate-new-scales-sql.ts');
    console.log('  3. Import the new scales to database');
  } else {
    console.log('\n⚠️  No new scales found. All valid scales have been imported.');
  }
}

main().catch(console.error);
