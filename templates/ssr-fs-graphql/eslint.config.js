import antfu from '@antfu/eslint-config'
import tanstackQuery from '@tanstack/eslint-plugin-query'

export default antfu(
  {
    formatters: true,
    react: true,
  },
  ...tanstackQuery.configs['flat/recommended'],
  {
    plugins: {
      '@tanstack/query': tanstackQuery,
    },
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
    },
  },
)
