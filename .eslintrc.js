module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  plugins: ['sonarjs', 'prettier'],
  extends: [
    // 'eslint:recommended',
    'semistandard',
    'plugin:sonarjs/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {}
};
