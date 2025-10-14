#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Issue {
  file: string;
  line: number;
  column: number;
  type: string;
  code: string;
  message: string;
}

const issues: Issue[] = [];

// Patterns to detect hardcoded text
const PATTERNS = [
  {
    name: 'isZh ternary',
    regex: /isZh\s*\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g,
    message: 'Found isZh ternary pattern - should use t() function'
  },
  {
    name: 'Chinese characters',
    regex: /['"][\u4e00-\u9fff]{2,}[^'"]*['"]/g,
    message: 'Found hardcoded Chinese text - should use t() function'
  },
  {
    name: 'toast without t()',
    regex: /toast\.(success|error|info|warning)\s*\(\s*['"][^'"]*['"]\s*\)/g,
    message: 'Toast message should use t() function'
  },
  {
    name: 'placeholder hardcode',
    regex: /placeholder\s*=\s*['"][\u4e00-\u9fff][^'"]*['"]/g,
    message: 'Placeholder should use t() function'
  }
];

async function scanFile(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Skip files that properly use useLanguage hook
  const hasUseLanguage = content.includes('useLanguage()');
  const hasTFunction = content.includes('const { t') || content.includes('const {t');

  // Only check files that should be internationalized
  if (!hasUseLanguage && !content.includes('use client')) {
    return; // Skip server components without i18n
  }

  lines.forEach((line, lineIndex) => {
    PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.regex);
      let match;

      while ((match = regex.exec(line)) !== null) {
        // Skip if it's in a comment
        const beforeMatch = line.substring(0, match.index);
        if (beforeMatch.includes('//')) continue;

        // Skip if it's already using t()
        if (line.includes('t(') && match.index > line.indexOf('t(')) continue;

        issues.push({
          file: path.relative(process.cwd(), filePath),
          line: lineIndex + 1,
          column: match.index + 1,
          type: pattern.name,
          code: match[0].substring(0, 60) + (match[0].length > 60 ? '...' : ''),
          message: pattern.message
        });
      }
    });
  });
}

async function main() {
  console.log('🔍 Scanning for hardcoded i18n text...\n');

  // Find all TSX files in src/app
  const files = await glob('src/app/**/*.tsx', {
    ignore: ['**/node_modules/**', '**/*.test.tsx', '**/*.spec.tsx']
  });

  console.log(`Found ${files.length} TSX files to scan\n`);

  // Scan each file
  for (const file of files) {
    await scanFile(file);
  }

  // Group issues by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];
    }
    acc[issue.file].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  // Print results
  if (issues.length === 0) {
    console.log('✅ No hardcoded i18n text found!\n');
    process.exit(0);
  }

  console.log(`❌ Found ${issues.length} issues in ${Object.keys(issuesByFile).length} files:\n`);

  Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
    console.log(`\n📄 ${file} (${fileIssues.length} issues)`);
    console.log('─'.repeat(80));

    fileIssues.forEach(issue => {
      console.log(`  ${issue.line}:${issue.column} [${issue.type}]`);
      console.log(`    ${issue.message}`);
      console.log(`    Code: ${issue.code}`);
      console.log('');
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log(`Total: ${issues.length} issues in ${Object.keys(issuesByFile).length} files`);
  console.log('='.repeat(80) + '\n');

  process.exit(1);
}

main().catch((error) => {
  console.error('Error running i18n check:', error);
  process.exit(1);
});
