import { readFile, writeFile } from 'node:fs/promises';
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

const inputFile = join(process.cwd(), 'storage/mengte-scales.json');
const existingIdsFile = join(process.cwd(), 'storage/existing-mengte-ids.json');
const outputFile = join(process.cwd(), 'scripts/crawlee/insert-mengte-scales.sql');

console.log('📖 Reading mengte scales data...\n');

const content = await readFile(inputFile, 'utf-8');
const scales: MengteScale[] = JSON.parse(content);

console.log('📖 Reading existing scale IDs from database...\n');
const existingIdsContent = await readFile(existingIdsFile, 'utf-8');
const existingIdsData = JSON.parse(existingIdsContent);
const existingIds = new Set(
  existingIdsData[0].results.map((r: { id: string }) => r.id)
);

console.log(`Found ${scales.length} scales in crawled data`);
console.log(`Found ${existingIds.size} existing scales in database`);

const newScales = scales.filter(scale => {
  const scaleId = `scale_mengte_${scale.id}`;
  return !existingIds.has(scaleId);
});

console.log(`✨ ${newScales.length} NEW scales to import\n`);

const now = Date.now();
const sqlStatements: string[] = [
  '-- Auto-generated SQL insert statements for ecoa_scale from mengte.online',
  `-- Generated at: ${new Date().toISOString()}`,
  `-- Total NEW records: ${newScales.length}`,
  `-- Total crawled: ${scales.length}, Already in DB: ${existingIds.size}`,
  `-- Source: https://mengte.online/medical_scales`,
  '',
];

function escapeString(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ')}'`;
}

function generateScaleId(id: string): string {
  return `scale_mengte_${id}`;
}

for (const scale of newScales) {
  const scaleId = generateScaleId(scale.id);

  const domains = JSON.stringify([scale.category]);
  const targetPopulation = '成人';
  const copyrightInfo = `来源: 梦特医数通 (mengte.online)`;

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
  ${escapeString(scaleId)}, ${now}, ${now}, 0,
  ${escapeString(scale.cnName)}, ${escapeString(scale.enName)}, ${escapeString(scale.abbrName)},
  ${escapeString(scale.description)}, NULL,
  NULL, 0, 0,
  '["中文"]', 'draft', ${escapeString(copyrightInfo)},
  NULL, NULL, ${escapeString(targetPopulation)},
  NULL, '${domains}', NULL,
  '[]', ${escapeString(scale.url)}, 1,
  0, 0, NULL
);`;

  sqlStatements.push(sql);
  sqlStatements.push('');
}

const finalSql = sqlStatements.join('\n');
await writeFile(outputFile, finalSql, 'utf-8');

console.log(`\n✅ SQL file generated: ${outputFile}`);
console.log(`📊 Total NEW INSERT statements: ${newScales.length}`);
console.log(`   - Crawled: ${scales.length}`);
console.log(`   - Already in DB: ${existingIds.size}`);
console.log(`   - New: ${newScales.length}`);

if (newScales.length > 0) {
  console.log('\n📝 Sample NEW scales (first 5):');
  newScales.slice(0, 5).forEach((scale, i) => {
    console.log(`  ${i + 1}. [${scale.id}] ${scale.cnName}`);
  });
}

console.log('\n✨ Next steps:');
if (newScales.length === 0) {
  console.log('  ⚠️  No new scales to import! All scales are already in the database.');
  console.log('  💡 Consider crawling more pages or other categories from mengte.online');
} else {
  console.log('  1. Review the SQL file');
  console.log('  2. Import to local database:');
  console.log('     pnpm exec wrangler d1 execute xcoa --local --file=scripts/crawlee/insert-mengte-scales.sql');
  console.log('  3. Import to remote database:');
  console.log('     pnpm exec wrangler d1 execute xcoa --remote --file=scripts/crawlee/insert-mengte-scales.sql');
}
