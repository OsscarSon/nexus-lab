import js from "@eslint/js";
import ts from "typescript-eslint";
export default ts.config(
  {
    ignores: [
      "dist/**",
      ".cache/**",
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "public/vendor/**",
    ],
  },
  {
    files: ["public/python-worker.js"],
    languageOptions: { globals: { onmessage: "writable" } },
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: { "@typescript-eslint/no-explicit-any": "error" },
  },
);
