module.exports = {
  'env': {
    es6: true,
    node: true,
    browser: true,
    jquery: true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 8,
  },
  'rules': {
    'indent': [
      'error',
      2,
      {'SwitchCase': 1}
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-extra-boolean-cast': ['off'],
    'no-console': ['off'],
    'no-useless-escape': ['off']
  }
};