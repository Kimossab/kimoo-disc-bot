import autofix from "eslint-plugin-sort-imports-es6-autofix";
import importNewLinesPlugin from "eslint-plugin-import-newlines";
import parserTs from "@typescript-eslint/parser";
import stylistic from "@stylistic/eslint-plugin";
import tsEslint from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  { ignores: ["build/", "coverage/", "src/**/*.d.ts"] },
  stylistic.configs["recommended-flat"],
  stylistic.configs.customize({
    semi: true,
    quotes: "double",
  }),
  {
    files: ["src/**/*.ts", "eslint.config.js"],
    plugins: {
      "import-newlines": importNewLinesPlugin,
      "unused-imports": unusedImports,
      "@typescript-eslint": tsEslint,
      "sort-imports-es6-autofix": autofix,
    },
    languageOptions: { parser: parserTs },
    rules: {
      "import-newlines/enforce": ["error", 2],
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "sort-imports-es6-autofix/sort-imports-es6": "error",
    },
  },
];
