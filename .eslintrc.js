module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  plugins: ['sonarjs'],
  extends: [
    // 'eslint:recommended',
    'semistandard',
    'plugin:sonarjs/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {

  }
};
