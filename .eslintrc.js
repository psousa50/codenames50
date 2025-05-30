const { FlatCompat } = require("@eslint/eslintrc")
const js = require("@eslint/js")

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.build-cache/**"],
  },
  ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),
  {
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "never"],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "_*" }],
      "@typescript-eslint/explicit-module-boundary-types": ["off"],
    },
  },
  {
    files: ["**/test/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": ["off"],
    },
  },
]
