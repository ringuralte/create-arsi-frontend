import type { CodegenConfig } from '@graphql-codegen/cli'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

const config: CodegenConfig = {
  // eslint-disable-next-line node/prefer-global/process
  schema: process.env.VITE_BASE_GRAPHQL_URL,
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
