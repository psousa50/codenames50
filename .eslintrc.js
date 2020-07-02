module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:jest/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest"],
  rules: {
    quotes: ["error", "double"],
    semi: ["error", "never"],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "_*" }],
    "@typescript-eslint/explicit-module-boundary-types": ["off"],
  },
  overrides: [
    {
      files: ["**/test/**"],
      rules: {
        "@typescript-eslint/no-explicit-any": ["off"],
      },
    },
  ],
}
