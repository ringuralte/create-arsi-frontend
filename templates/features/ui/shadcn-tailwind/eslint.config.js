import antfu from '@antfu/eslint-config'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import tanstackQuery from '@tanstack/eslint-plugin-query'

export default antfu(
  {
    formatters: true,
    react: true,
  },
  ...tanstackQuery.configs['flat/recommended'],
  {
    plugins: {
      'better-tailwindcss': betterTailwind,
      '@tanstack/query': tanstackQuery,
    },
    rules: {
      ...betterTailwind.configs.recommended.rules,
      'eslint-comments/no-unlimited-disable': 'off',
      'better-tailwindcss/no-unregistered-classes': 'off',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/app.css',
      },
    },
  },
)
