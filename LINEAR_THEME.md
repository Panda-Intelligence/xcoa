# Linear Dark Modern Theme Integration

This document describes the Linear.app-inspired design system that has been integrated into the project.

## Overview

The Linear Dark Modern theme has been extracted from [Linear.app](https://linear.app) and integrated into the dark mode styling system. The design uses modern OKLCH color space for better color accuracy and consistency.

## What Changed

### 1. Dark Mode Colors (`.dark` class in `globals.css`)

All dark mode colors now use the Linear Dark Modern palette:
- **Background**: Deep dark purple-tinted background
- **Primary Brand**: Purple accent color (`oklch(0.65 0.25 285)`)
- **Text Colors**: High contrast white/gray text for readability
- **Border Colors**: Subtle purple-tinted borders

### 2. Shadow System

Updated to use OKLCH-based shadows that complement the Linear purple theme:
- `--shadow-xs` through `--shadow-2xl`: Standard elevation shadows
- `--shadow-primary`, `--shadow-secondary`, `--shadow-accent`: Colored shadows for brand elements

### 3. Design Token Reference

All Linear design tokens are available as CSS custom properties in dark mode:

#### Surface Colors
```css
--linear-background: oklch(0.12 0.01 285)   /* Deep dark */
--linear-elevated: oklch(0.16 0.01 285)     /* Slightly elevated */
--linear-card: oklch(0.14 0.01 285)         /* Card surfaces */
--linear-overlay: oklch(0.10 0.01 285)      /* Darkest overlay */
```

#### Brand Colors
```css
--linear-primary: oklch(0.65 0.25 285)          /* Purple primary */
--linear-primary-hover: oklch(0.70 0.25 285)    /* Lighter purple hover */
--linear-secondary: oklch(0.60 0.22 290)        /* Secondary purple */
--linear-accent: oklch(0.75 0.20 280)           /* Accent purple */
```

#### Text Colors
```css
--linear-text-primary: oklch(0.95 0.01 285)     /* High contrast white */
--linear-text-secondary: oklch(0.70 0.02 285)   /* Gray text */
--linear-text-tertiary: oklch(0.50 0.02 285)    /* Muted gray */
--linear-text-disabled: oklch(0.35 0.01 285)    /* Disabled state */
```

#### Border Colors
```css
--linear-border-default: oklch(0.25 0.01 285)   /* Standard borders */
--linear-border-hover: oklch(0.35 0.02 285)     /* Hover state */
--linear-border-focus: oklch(0.65 0.25 285)     /* Focus rings */
--linear-border-subtle: oklch(0.18 0.01 285)    /* Subtle dividers */
```

#### Semantic Colors
```css
--linear-success: oklch(0.65 0.20 145)  /* Green success */
--linear-warning: oklch(0.70 0.20 85)   /* Yellow warning */
--linear-error: oklch(0.60 0.25 25)     /* Red error */
--linear-info: oklch(0.65 0.20 240)     /* Blue info */
```

## Usage

### Automatic Application

The Linear theme is automatically applied in dark mode. All Shadcn UI components will use the Linear colors through the mapped CSS variables:

- `--background` → Linear background
- `--primary` → Linear primary purple
- `--border` → Linear borders
- `--foreground` → Linear text colors

### Direct Token Usage

You can use Linear-specific tokens directly in your components:

```css
.custom-element {
  background: var(--linear-card);
  border: 1px solid var(--linear-border-subtle);
  color: var(--linear-text-primary);
}
```

### Tailwind Utilities

Continue using standard Tailwind classes - they'll automatically pick up the Linear theme in dark mode:

```tsx
<div className="bg-background border border-border text-foreground">
  <button className="bg-primary text-primary-foreground">
    Linear-styled button
  </button>
</div>
```

## Typography

The theme uses **Inter** font family (already configured in your project), which matches Linear's typography system.

## Design Philosophy

The Linear Dark Modern theme emphasizes:
- **High Contrast**: Clear distinction between elements
- **Purple Brand Identity**: Consistent purple accent throughout
- **Modern Color Science**: OKLCH color space for perceptual uniformity
- **Minimal & Clean**: Generous whitespace and subtle borders
- **Accessibility**: WCAG AA compliant contrast ratios

## Original Design System

The complete extracted design system is available in:
```
.workflow/.design/run-20251016-194120/style-consolidation/style-1/
├── design-tokens.json       # Full token specification
└── style-guide.md          # Design philosophy and guidelines
```

## Preview

To see the prototype of the Linear theme:
```bash
open .workflow/.design/run-20251016-194120/prototypes/index.html
```

## Light Mode

The light mode remains unchanged with your original color scheme. Only dark mode has been updated with the Linear theme.

---

**Generated**: 2025-10-16
**Source**: Linear.app UI design imitation workflow
**Theme**: Linear Dark Modern
