// @ts-nocheck
import { describe, it, expect, beforeAll } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe.skip('Nuxt API: /api/dictionary protection', async () => {
  await setup({ server: true, browser: false })

  it('returns 401 when Authorization is missing/invalid', async () => {
    let error: any = null
    try {
      await $fetch('/api/dictionary')
    } catch (e) {
      error = e
    }
    const status = error?.status || error?.statusCode || error?.response?.status
    expect(status).toBe(401)
  })
})
