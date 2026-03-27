module.exports = [
  {
    ignores: ["node_modules", "dist"],
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: { console: "readonly", process: "readonly" },
    },
    plugins: {
      import: require("eslint-plugin-import"),
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "next" }],
      "import/no-unresolved": "off",
    },
  },
];
