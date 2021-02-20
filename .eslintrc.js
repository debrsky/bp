module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  plugins: ['sonarjs', 'prettier', 'json'],
  extends: [
    // 'eslint:recommended',
    'semistandard',
    'plugin:sonarjs/recommended',
    'plugin:json/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {}
};

// TODO разобраться, почему в VSCODE не работает автоформатирование json-файлов.
