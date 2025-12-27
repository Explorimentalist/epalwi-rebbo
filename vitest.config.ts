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
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [resolve(rootDir, 'tests/setup.ts')],
    include: [
      'server/**/*.test.ts',
      'middleware/**/*.test.ts',
      'utils/**/*.test.ts',
      'composables/**/*.test.ts',
      'components/**/*.test.ts',
      'pages/**/*.test.ts',
      'lib/**/*.test.ts'
    ],
    exclude: ['node_modules', '.nuxt', '.output']
  }
})
