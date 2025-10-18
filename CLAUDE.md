- Use `pnpm` as package manager for current project!
- 项目的说明性文档都在 docs 目录下

## Internationalization (i18n) Guidelines

This project uses a custom i18n system based on React Context and JSON translation files.

### Translation System Architecture

**Core Components:**
- `src/hooks/useLanguage.tsx` - Main hook providing `t()` function and language switching
- `public/locales/{zh,en}/*.json` - Translation files organized by module
- `scripts/i18n-check.ts` - Automated validation script (runs in CI/CD)

**Supported Languages:**
- `zh` - Chinese (Simplified)
- `en` - English

### Translation Key Naming Convention

Follow the hierarchical naming pattern: `{module}.{component}.{element}`

**Examples:**
- `landing.nav.brand_name` - Brand name in landing page navigation
- `landing.search.brand_name` - Brand name in search interface
- `landing.footer.address_line1` - First line of footer address
- `forms.date_picker.quick_select` - Quick select label in date picker
- `common.table.rows_per_page` - Table pagination text

**Module Categories:**
- `landing` - Landing page components
- `forms` - Form components (date picker, drawing tool, etc.)
- `common` - Shared UI components (tables, buttons, etc.)
- `navigation` - Navigation menu items
- `footer` - Footer links and information
- `search` - Search interface elements
- `legal` - Legal pages (privacy, terms, cookie policy)

### Usage Pattern

**1. Import the hook:**
```typescript
import { useLanguage } from '@/hooks/useLanguage';
```

**2. Use in component:**
```typescript
export function MyComponent() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('landing.nav.brand_name', 'Open eCOA')}</h1>
    </div>
  );
}
```

**3. Translation function signature:**
```typescript
t(key: string, fallback: string): string
```
- `key` - Translation key following naming convention
- `fallback` - Default text (should match original hardcoded text)

### Best Practices

**DO:**
- ✅ Always provide fallback values matching original text
- ✅ Use descriptive key names that indicate content purpose
- ✅ Add translation keys to BOTH `zh` and `en` locale files
- ✅ Test components in both languages before committing
- ✅ Run `pnpm run i18n:check` to validate translations before commit

**DON'T:**
- ❌ Leave hardcoded text in components
- ❌ Use generic key names like `text1`, `label2`
- ❌ Skip fallback values in t() calls
- ❌ Add translations to only one language file
- ❌ Commit without running i18n validation

### Validation Script

**Local validation:**
```bash
pnpm run i18n:check
```

**CI/CD Integration:**
The i18n validation runs automatically on every pull request via GitHub Actions.

**Validation checks:**
- Translation key consistency across all locale files
- Missing translations detection
- Unused translation keys identification
- Translation file format validation

### Adding New Translations

**Step 1:** Identify hardcoded text in component
```typescript
<h1>Open eCOA</h1>
```

**Step 2:** Choose appropriate translation key
```typescript
// landing.nav.brand_name
```

**Step 3:** Add to locale files
```json
// public/locales/zh/landing.json
{
  "nav": {
    "brand_name": "Open eCOA"
  }
}

// public/locales/en/landing.json
{
  "nav": {
    "brand_name": "Open eCOA"
  }
}
```

**Step 4:** Replace in component
```typescript
import { useLanguage } from '@/hooks/useLanguage';

export function Navigation() {
  const { t } = useLanguage();

  return <h1>{t('landing.nav.brand_name', 'Open eCOA')}</h1>;
}
```

**Step 5:** Validate and test
```bash
pnpm run i18n:check  # Validate translations
pnpm dev             # Test in browser (switch languages)
```

### Language Switching

Users can switch languages using the `<LanguageToggle />` component in the navigation bar.

**Implementation:**
```typescript
import { LanguageToggle, useLanguage } from '@/hooks/useLanguage';

// In your navigation component
<LanguageToggle />
```

**Current language detection:**
```typescript
const { language } = useLanguage();  // 'zh' or 'en'
```

### Migration Status

**Completed Components:**
- ✅ High-priority form components (IMPL-002)
  - SearchInterface.tsx
  - DateQuestionRenderer.tsx
  - DrawingQuestionRenderer.tsx
  - data-table.tsx
- ✅ Medium-priority landing components (IMPL-004)
  - Navigation.tsx
  - GoogleStyleSearch.tsx
  - Footer.tsx

**Pending Components:**
All other components with hardcoded text should follow the same pattern when refactored.

### Troubleshooting

**Issue: Blank text appears after adding translation**
- Check translation key exists in BOTH locale files
- Verify key path matches exactly (case-sensitive)
- Ensure fallback value is provided in t() call
- Run `pnpm run i18n:check` to identify missing keys

**Issue: Translation not updating when switching language**
- Verify `useLanguage()` hook is imported correctly
- Check React component re-renders when language changes
- Clear browser cache and reload

**Issue: CI/CD validation fails**
- Run `pnpm run i18n:check` locally to see specific errors
- Fix missing or inconsistent translation keys
- Ensure all locale files are valid JSON format