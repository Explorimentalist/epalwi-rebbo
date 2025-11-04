// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils'

// Skipped due to sandbox and port constraints; enable locally/CI
describe.skip('Nuxt Page: /dictionary redirect behavior', async () => {
  await setup({ server: true, browser: true })

  it('redirects unauthenticated users to /auth/login', async () => {
    const page = await createPage('/')
    await page.goto('/dictionary')
    // Expect login redirect with return param
    expect(page.url()).toContain('/auth/login')
    expect(page.url()).toContain('return=%2Fdictionary')
  })
})

