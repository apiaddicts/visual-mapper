module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': 0,
    'no-trailing-spaces': 'off',
    'import/extensions': 'off',
    'brace-style': 'off',
    'linebreak-style': 'off'
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
};
