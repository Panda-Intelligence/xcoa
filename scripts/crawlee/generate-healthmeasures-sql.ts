import { readFile, writeFile } from 'node:fs/promises';
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

const inputFile = join(process.cwd(), 'storage/healthmeasures-scales.json');
const existingIdsFile = join(process.cwd(), 'storage/existing-healthmeasures-ids.json');
const outputFile = join(process.cwd(), 'scripts/crawlee/insert-healthmeasures-scales.sql');

console.log('📖 Reading HealthMeasures scales data...\n');

const content = await readFile(inputFile, 'utf-8');
const scales: HealthMeasuresScale[] = JSON.parse(content);

console.log(`Found ${scales.length} scales in HealthMeasures data`);

let existingIds = new Set<string>();
try {
  console.log('📖 Reading existing scale IDs from database...\n');
  const existingIdsContent = await readFile(existingIdsFile, 'utf-8');
  const existingIdsData = JSON.parse(existingIdsContent);
  existingIds = new Set(
    existingIdsData[0].results.map((r: { json: string }) => {
      const parsed = JSON.parse(r.json);
      return parsed.id;
    })
  );
  console.log(`Found ${existingIds.size} existing scales in database`);
} catch (error) {
  console.log('⚠️  No existing scales file found, will import all scales');
}

const newScales = scales.filter(scale => {
  const scaleId = generateScaleId(scale.id);
  return !existingIds.has(scaleId);
});

console.log(`✨ ${newScales.length} NEW scales to import\n`);

const now = Date.now();
const sqlStatements: string[] = [
  '-- Auto-generated SQL insert statements for ecoa_scale from HealthMeasures',
  `-- Generated at: ${new Date().toISOString()}`,
  `-- Total NEW records: ${newScales.length}`,
  `-- Total in file: ${scales.length}, Already in DB: ${existingIds.size}`,
  `-- Source: HealthMeasures / NIH (healthmeasures.net)`,
  '',
];

function escapeString(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ')}'`;
}

function generateScaleId(id: string): string {
  return `scale_hm_${id}`;
}

for (const scale of newScales) {
  const scaleId = generateScaleId(scale.id);

  const domains = JSON.stringify([scale.domain]);
  const languages = JSON.stringify([scale.language]);

  // Use Chinese name if available, otherwise use English name
  const chineseName = scale.name || scale.nameEn;

  // Determine target population based on domain
  const targetPopulation = scale.domain.includes('Pediatric') || scale.domain.includes('Parent Proxy')
    ? '儿童/青少年'
    : '成人';

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
  ${escapeString(chineseName)}, ${escapeString(scale.nameEn)}, ${escapeString(scale.acronym)},
  ${escapeString(scale.description)}, NULL,
  NULL, ${scale.itemsCount || 'NULL'}, 0,
  '${languages}', ${escapeString(scale.validationStatus || 'published')}, ${escapeString(scale.copyrightInfo)},
  ${escapeString(scale.scoringMethod)}, ${escapeString(scale.administrationTime)}, ${escapeString(targetPopulation)},
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
  console.log('  ⚠️  No new scales to import! All HealthMeasures scales are already in the database.');
} else {
  console.log('  1. Review the SQL file');
  console.log('  2. Query existing scale IDs (optional):');
  console.log(`     pnpm exec wrangler d1 execute xcoa --local --command="SELECT id FROM ecoa_scale WHERE id LIKE 'scale_hm_%'" --json > storage/existing-healthmeasures-ids.json`);
  console.log('  3. Re-run this script to check for duplicates (optional)');
  console.log('  4. Import to local database:');
  console.log('     pnpm exec wrangler d1 execute xcoa --local --file=scripts/crawlee/insert-healthmeasures-scales.sql');
  console.log('  5. Import to remote database:');
  console.log('     pnpm exec wrangler d1 execute xcoa --remote --file=scripts/crawlee/insert-healthmeasures-scales.sql');
}
