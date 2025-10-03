#!/usr/bin/env node

/**
 * Stripe Configuration Diagnostic Tool
 * Run this to verify your Stripe setup
 */

const chalk = require('chalk');

console.log(chalk.bold.cyan('\n🔍 Stripe Configuration Diagnostic\n'));

// Check environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID',
  'NEXT_PUBLIC_APP_URL',
];

const optionalEnvVars = [
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

console.log(chalk.bold('1. Environment Variables Check:\n'));

let allRequiredPresent = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(chalk.green('✓'), varName, chalk.gray(`(${value.substring(0, 20)}...)`));
  } else {
    console.log(chalk.red('✗'), varName, chalk.red('MISSING'));
    allRequiredPresent = false;
  }
});

console.log(chalk.dim('\nOptional:'));
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(chalk.green('✓'), varName, chalk.gray(`(${value.substring(0, 20)}...)`));
  } else {
    console.log(chalk.yellow('○'), varName, chalk.gray('not set'));
  }
});

// Check Stripe key mode
console.log(chalk.bold('\n2. Stripe API Key Mode:\n'));
const secretKey = process.env.STRIPE_SECRET_KEY;
if (secretKey) {
  if (secretKey.startsWith('sk_test_')) {
    console.log(chalk.yellow('⚠'), 'Using TEST mode');
    console.log(chalk.dim('   Make sure your price IDs are from TEST mode'));
  } else if (secretKey.startsWith('sk_live_')) {
    console.log(chalk.green('✓'), 'Using LIVE mode');
    console.log(chalk.dim('   Make sure your price IDs are from LIVE mode'));
  } else {
    console.log(chalk.red('✗'), 'Invalid API key format');
  }
}

// Check price ID format
console.log(chalk.bold('\n3. Price ID Format Check:\n'));
const priceIds = [
  { name: 'Starter Monthly', key: 'NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID' },
  { name: 'Starter Yearly', key: 'NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID' },
  { name: 'Enterprise Monthly', key: 'NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID' },
  { name: 'Enterprise Yearly', key: 'NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID' },
];

let allPriceIdsValid = true;
priceIds.forEach(({ name, key }) => {
  const value = process.env[key];
  if (value) {
    if (value.startsWith('price_')) {
      console.log(chalk.green('✓'), name, chalk.gray(value));
    } else {
      console.log(chalk.red('✗'), name, chalk.red(`Invalid format: ${value}`));
      console.log(chalk.dim('   Should start with "price_"'));
      allPriceIdsValid = false;
    }
  } else {
    console.log(chalk.red('✗'), name, chalk.red('MISSING'));
    allPriceIdsValid = false;
  }
});

// Check APP URL
console.log(chalk.bold('\n4. App URL Check:\n'));
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (appUrl) {
  if (appUrl.startsWith('http://') || appUrl.startsWith('https://')) {
    console.log(chalk.green('✓'), 'Valid format:', appUrl);
    if (appUrl.startsWith('http://') && !appUrl.includes('localhost')) {
      console.log(chalk.yellow('⚠'), 'Using HTTP in non-localhost. Consider using HTTPS in production');
    }
  } else {
    console.log(chalk.red('✗'), 'Missing protocol (http:// or https://):', appUrl);
  }
} else {
  console.log(chalk.yellow('○'), 'Not set, will use default:', 'http://localhost:3000');
}

// Summary
console.log(chalk.bold('\n5. Summary:\n'));
if (allRequiredPresent && allPriceIdsValid) {
  console.log(chalk.green.bold('✓ All required configuration is present and valid!'));
  console.log(chalk.dim('\nNext steps:'));
  console.log(chalk.dim('1. Run the dev server: pnpm dev'));
  console.log(chalk.dim('2. Navigate to /billing/subscription'));
  console.log(chalk.dim('3. Try subscribing to a plan'));
} else {
  console.log(chalk.red.bold('✗ Configuration issues detected'));
  console.log(chalk.dim('\nTo fix:'));
  console.log(chalk.dim('1. Copy .env.example to .env if you haven\'t'));
  console.log(chalk.dim('2. Fill in missing values from Stripe Dashboard'));
  console.log(chalk.dim('3. Make sure you\'re using the correct mode (test/live)'));
  console.log(chalk.dim('4. See STRIPE_SETUP.md for detailed instructions'));
}

console.log(chalk.dim('\n📖 For more help, see: STRIPE_SETUP.md\n'));
