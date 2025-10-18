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
    name: 'Chinese characters in JSX',
    regex: />\s*[\u4e00-\u9fff]{2,}[^<]*</g,
    message: 'Found hardcoded Chinese text in JSX - should use {t()} function'
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
  },
  {
    name: 'English phrases in strings',
    regex: /['"](Sign in|Log out|Log in|Submit|Cancel|Confirm|Delete|Edit|Save|Create|Update|Search|Filter|Settings|Profile|Dashboard|Welcome|Error|Success|Warning|Loading|Please|Thank you)[^'"]*['"]/gi,
    message: 'Found hardcoded English text - should use t() function'
  },
  {
    name: 'title attribute hardcode',
    regex: /title\s*=\s*['"][\u4e00-\u9fff][^'"]*['"]/g,
    message: 'Title attribute should use t() function'
  },
  {
    name: 'aria-label hardcode',
    regex: /aria-label\s*=\s*['"][\u4e00-\u9fff][^'"]*['"]/g,
    message: 'Aria-label should use t() function'
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
    // Skip comment lines entirely
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
      return;
    }

    // Skip import statements
    if (trimmedLine.startsWith('import ')) {
      return;
    }

    PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.regex);
      let match;

      while ((match = regex.exec(line)) !== null) {
        // Skip if it's in a comment (inline comments)
        const beforeMatch = line.substring(0, match.index);
        if (beforeMatch.includes('//')) continue;

        // Skip if it's already using t()
        if (line.includes('t(') && match.index > line.indexOf('t(')) continue;

        // Skip if it's in import statement or className
        if (beforeMatch.includes('import ') || beforeMatch.includes('className=')) continue;

        // Skip common non-translatable strings
        const matchText = match[0];
        if (
          matchText.includes('http://') ||
          matchText.includes('https://') ||
          matchText.includes('mailto:') ||
          matchText.includes('tel:') ||
          /^['"][a-zA-Z0-9_-]+['"]$/.test(matchText) // Single word identifiers
        ) {
          continue;
        }

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

  // Find all TSX and TS files in src directory, excluding test files and locale files
  const files = await glob('src/**/*.{tsx,ts}', {
    ignore: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.git/**',
      '**/*.test.tsx',
      '**/*.test.ts',
      '**/*.spec.tsx',
      '**/*.spec.ts',
      '**/locales/**',
      '**/i18n/**'
    ]
  });

  console.log(`Found ${files.length} files to scan\n`);

  // Scan each file with progress indicator
  const startTime = Date.now();
  for (let i = 0; i < files.length; i++) {
    await scanFile(files[i]);

    // Show progress every 50 files
    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${files.length} files scanned...`);
    }
  }
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\nScan completed in ${duration}s\n`);

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

  // Exit with error code for CI/CD
  process.exit(1);
}

main().catch((error) => {
  console.error('Error running i18n check:', error);
  process.exit(1);
});
