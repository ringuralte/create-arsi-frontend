import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    reactRouter(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [
          ['babel-plugin-react-compiler'],
        ],
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
  },
})
