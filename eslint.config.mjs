import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
    }
  },
  {
    files: [
      "src/**/*.{js,jsx,ts,tsx}",
    ]
  },
  {
    ignores: [
      "dist/", // Ignore the entire 'dist' directory
      "node_modules/", // Ignore the entire 'node_modules' directory
      "*.test.js", // Ignore all files ending with '.test.js'
      "scripts/"
    ],
  }
];

export default eslintConfig;
