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

const datasetDir = join(process.cwd(), 'storage/datasets/default');
const outputFile = join(process.cwd(), 'scripts/crawlee/insert-scales.sql');

const files = await readdir(datasetDir);
const validData: CrawledData[] = [];

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  
  const filePath = join(datasetDir, file);
  const content = await readFile(filePath, 'utf-8');
  const data: CrawledData = JSON.parse(content);
  
  if (data.url.match(/^https:\/\/www\.usecoa\.com\/\?p=\d+$/)) {
    validData.push(data);
  }
}

console.log(`Found ${validData.length} valid scale records`);

const now = Date.now();
const sqlStatements: string[] = [
  '-- Auto-generated SQL insert statements for ecoa_scale',
  `-- Generated at: ${new Date().toISOString()}`,
  `-- Total records: ${validData.length}`,
  '',
];

for (const data of validData) {
  const id = data.url.split('=')[1];
  const domains = JSON.stringify(data.domain.map(d => d.text));
  const languages = JSON.stringify(data.languages.map(l => l.text));
  const targetPopulation = data.target.map(t => t.text).join(', ');
  const copyrightInfo = `作者: ${data.author}; 版权方: ${data.copyrightHolder}; 授权类型: ${data.businessLicenseTypes.map(b => b.text).join(', ')}`;
  
  const sql = `INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  \`references\`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  '${id}', ${now}, ${now}, 0,
  ${escapeString(data.cnName)}, ${escapeString(data.enName)}, ${escapeString(data.abbrName)},
  ${escapeString(data.abstract)}, NULL,
  NULL, 0, 0,
  '${languages}', 'published', ${escapeString(copyrightInfo)},
  NULL, NULL, ${escapeString(targetPopulation)},
  NULL, '${domains}', NULL,
  '[]', NULL, 1,
  0, 0, NULL
);`;
  
  sqlStatements.push(sql);
  sqlStatements.push('');
}

function escapeString(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, '')}'`;
}

const finalSql = sqlStatements.join('\n');
await writeFile(outputFile, finalSql, 'utf-8');

console.log(`SQL file generated: ${outputFile}`);
console.log(`Total INSERT statements: ${validData.length}`);
