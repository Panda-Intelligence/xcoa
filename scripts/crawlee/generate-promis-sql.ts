import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface PromisScale {
  id: string;
  name: string;
  nameEn: string;
  domain: string;
  subdomain: string;
  itemsCount: number;
  description: string;
  scoringMethod: string;
  administrationTime: string;
  validationStatus: string;
  pdfUrl?: string;
  copyrightInfo: string;
}

const inputFile = join(process.cwd(), 'storage/promis-scales-initial.json');
const existingIdsFile = join(process.cwd(), 'storage/existing-promis-ids.json');
const outputFile = join(process.cwd(), 'scripts/crawlee/insert-promis-scales.sql');

console.log('📖 Reading PROMIS scales data...\n');

const content = await readFile(inputFile, 'utf-8');
const scales: PromisScale[] = JSON.parse(content);

console.log(`Found ${scales.length} scales in PROMIS data`);

let existingIds = new Set<string>();
try {
  console.log('📖 Reading existing scale IDs from database...\n');
  const existingIdsContent = await readFile(existingIdsFile, 'utf-8');
  const existingIdsData = JSON.parse(existingIdsContent);
  existingIds = new Set(
    existingIdsData[0].results.map((r: { id: string }) => r.id)
  );
  console.log(`Found ${existingIds.size} existing PROMIS scales in database`);
} catch (error) {
  console.log('⚠️  No existing PROMIS scales file found, will import all scales');
}

const newScales = scales.filter(scale => {
  const scaleId = `scale_promis_${scale.id}`;
  return !existingIds.has(scaleId);
});

console.log(`✨ ${newScales.length} NEW scales to import\n`);

const now = Date.now();
const sqlStatements: string[] = [
  '-- Auto-generated SQL insert statements for ecoa_scale from PROMIS (NIH)',
  `-- Generated at: ${new Date().toISOString()}`,
  `-- Total NEW records: ${newScales.length}`,
  `-- Total in file: ${scales.length}, Already in DB: ${existingIds.size}`,
  `-- Source: PROMIS / NIH (healthmeasures.net)`,
  '',
];

function escapeString(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ')}'`;
}

function generateScaleId(id: string): string {
  return `scale_promis_${id}`;
}

for (const scale of newScales) {
  const scaleId = generateScaleId(scale.id);

  const domains = JSON.stringify([scale.domain]);
  const targetPopulation = '成人';
  const languages = JSON.stringify(['英文']);

  const acronymValue = scale.id.toUpperCase().replace(/_/g, '-');

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
  ${escapeString(scale.name)}, ${escapeString(scale.nameEn)}, ${escapeString(acronymValue)},
  ${escapeString(scale.description)}, NULL,
  NULL, ${scale.itemsCount}, 0,
  '${languages}', ${escapeString(scale.validationStatus)}, ${escapeString(scale.copyrightInfo)},
  ${escapeString(scale.scoringMethod)}, ${escapeString(scale.administrationTime)}, ${escapeString(targetPopulation)},
  NULL, '${domains}', NULL,
  '[]', ${escapeString(scale.pdfUrl || 'https://www.healthmeasures.net/explore-measurement-systems/promis')}, 1,
  0, 0, NULL
);`;

  sqlStatements.push(sql);
  sqlStatements.push('');
}

const finalSql = sqlStatements.join('\n');
await writeFile(outputFile, finalSql, 'utf-8');

console.log(`\n✅ SQL file generated: ${outputFile}`);
console.log(`📊 Total NEW INSERT statements: ${newScales.length}`);
console.log(`   - In file: ${scales.length}`);
console.log(`   - Already in DB: ${existingIds.size}`);
console.log(`   - New: ${newScales.length}`);

if (newScales.length > 0) {
  console.log('\n📝 Sample NEW scales (first 5):');
  newScales.slice(0, 5).forEach((scale, i) => {
    console.log(`  ${i + 1}. [${scale.id}] ${scale.nameEn}`);
  });
}

console.log('\n✨ Next steps:');
if (newScales.length === 0) {
  console.log('  ⚠️  No new scales to import! All PROMIS scales are already in the database.');
} else {
  console.log('  1. Review the SQL file');
  console.log('  2. Query existing PROMIS scale IDs:');
  console.log(`     pnpm exec wrangler d1 execute xcoa --local --command="SELECT id FROM ecoa_scale WHERE id LIKE 'scale_promis_%'" --json > storage/existing-promis-ids.json`);
  console.log('  3. Re-run this script to check for duplicates (optional)');
  console.log('  4. Import to local database:');
  console.log('     pnpm exec wrangler d1 execute xcoa --local --file=scripts/crawlee/insert-promis-scales.sql');
  console.log('  5. Import to remote database:');
  console.log('     pnpm exec wrangler d1 execute xcoa --remote --file=scripts/crawlee/insert-promis-scales.sql');
}
