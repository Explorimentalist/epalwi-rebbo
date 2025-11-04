import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': rootDir,
      '~~': rootDir,
      '@': rootDir,
      '@@': rootDir
    }
  },
  test: { reporters: 'dot', globals: true },
  projects: [
    {
      test: {
        name: 'node',
        environment: 'node',
        include: [
          'server/**/*.test.ts',
          'middleware/**/*.test.ts',
          'utils/**/*.test.ts',
          'composables/**/*.test.ts'
        ],
        exclude: ['node_modules', '.nuxt', '.output']
      }
    },
    {
      test: {
        name: 'dom',
        environment: 'happy-dom',
        setupFiles: [resolve(rootDir, 'tests/setup.ts')],
        include: [
          'components/**/*.test.ts',
          'pages/**/*.test.ts'
        ],
        exclude: ['node_modules', '.nuxt', '.output']
      }
    }
  ]
})
