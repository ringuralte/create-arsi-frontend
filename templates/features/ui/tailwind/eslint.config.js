import antfu from '@antfu/eslint-config'
import betterTailwind from 'eslint-plugin-better-tailwindcss'

export default antfu(
  {
    formatters: true,
    react: true,
  },
  {
    plugins: {
      'better-tailwindcss': betterTailwind,
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
