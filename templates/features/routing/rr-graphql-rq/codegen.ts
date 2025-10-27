import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: import.meta.env.VITE_BASE_GRAPHQL_URL,
  documents: ['app/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    'app/gql/': {
      preset: 'client',
      plugins: ['typescript', 'typescript-operations'],
      config: {
        useTypeImports: true,
      },
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
}

export default config
