/**
 * Global $fetch interceptor to attach Authorization header
 * - In production: attaches Firebase ID token if available
 * - In development with devAuthMock: attaches X-Dev-Auth-User header from sessionStorage
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

        // Try to attach Firebase ID token if user is signed in
        try {
          const { getFirebaseAuth } = await import('~/services/firebase')
          const auth = getFirebaseAuth()
          const currentUser: any = auth?.currentUser
          if (currentUser?.getIdToken) {
            const idToken = await currentUser.getIdToken()
            if (idToken) {
              ;(options.headers as any)['Authorization'] = `Bearer ${idToken}`
              return
            }
          }
        } catch {
          // ignore and fall back to dev header if enabled
        }

        // Development fallback: send dev auth user via custom header
        const devMock = Boolean((runtime as any)?.public?.devAuthMock)
        if (import.meta.dev && devMock) {
          try {
            const persisted = sessionStorage.getItem('dev-auth-user')
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
