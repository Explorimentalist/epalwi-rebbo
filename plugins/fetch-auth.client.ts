/**
 * Global $fetch interceptor to attach Authorization header
 * - Attaches JWT session token if available from sessionStorage
 * - Falls back to development auth header if configured
 */
export default defineNuxtPlugin((nuxtApp) => {
  const runtime = useRuntimeConfig()

  const fetchWithAuth = $fetch.create({
    onRequest: async ({ request, options }) => {
      try {
        const urlStr = typeof request === 'string' ? request : String(request)
        // Only add auth to same-origin API calls
        if (!urlStr.startsWith('/api/')) {
          return
        }

        options.headers = options.headers || {}

        // Try to attach JWT session token if available
        try {
          const sessionToken = sessionStorage.getItem('auth-session-token')
          if (sessionToken) {
            ;(options.headers as any)['Authorization'] = `Bearer ${sessionToken}`
            return
          }
        } catch {
          // ignore if sessionStorage is not available
        }

        // Development fallback: send dev auth user via custom header
        const devMock = Boolean((runtime as any)?.public?.devAuthMock)
        if (import.meta.dev && devMock) {
          try {
            const persisted = sessionStorage.getItem('auth-user')
            if (persisted) {
              const base64 = btoa(persisted)
              ;(options.headers as any)['X-Dev-Auth-User'] = base64
            }
          } catch {
            // no-op
          }
        }
      } catch {
        // fail open; request proceeds without auth headers
      }
    }
  })

  // Expose as injected and also override global $fetch so existing calls use it
  // 1) make available as nuxtApp.$fetch
  ;(nuxtApp as any).$fetch = fetchWithAuth as any
  // 2) override globalThis.$fetch for direct calls
  try { (globalThis as any).$fetch = fetchWithAuth as any } catch {}

  return { provide: { fetch: fetchWithAuth } }
})
