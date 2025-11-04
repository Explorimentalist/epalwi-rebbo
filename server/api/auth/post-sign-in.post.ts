/**
 * Post Sign-In Upsert Endpoint
 * POST /api/auth/post-sign-in
 *
 * After the client completes Firebase Email Link sign-in, it calls this
 * endpoint to ensure a Firestore user profile exists/updates and to set
 * custom claims (role, subscriptionStatus).
 */

import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { UserProfile, SubscriptionStatus } from '~/types/auth'

function ensureAdminInitialized() {
  if (getApps().length === 0) {
    // Use ADC in production (Firebase Functions recommended)
    initializeApp({ credential: applicationDefault() })
  }
}

function calculateTrialInfo(createdAt: Date) {
  const trialDays = 14
  const startDate = new Date(createdAt)
  const endDate = new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000)
  const now = new Date()
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
  const isExpired = now > endDate
  return { startDate, endDate, daysRemaining, isExpired }
}

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')

  const config = useRuntimeConfig()
  const devMock = Boolean((config as any)?.public?.devAuthMock)

  const body = await readBody<{ uid?: string; email?: string }>(event)
  if (!body?.uid) {
    throw createError({ statusCode: 400, statusMessage: 'uid required' })
  }

  // In production, verify caller via ID token
  const authHeader = getHeader(event, 'authorization') || ''
  const idToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : null

  // Fallback path for local/dev without Admin credentials
  if (devMock) {
    const now = new Date()
    const trial = calculateTrialInfo(now)
    const user: UserProfile = {
      uid: body.uid,
      email: body.email || 'user@example.com',
      displayName: undefined,
      photoURL: undefined,
      role: 'user',
      createdAt: now,
      lastLoginAt: now,
      subscription: { status: 'trial' },
      trial,
      preferences: { defaultLanguage: 'español', notifications: { productUpdates: false, languageTips: false } },
      preferencesUpdatedAt: now,
      emailVerified: true,
      isActive: true
    }
    return { success: true, user, claimsUpdated: false }
  }

  try {
    ensureAdminInitialized()
    if (!idToken) throw createError({ statusCode: 401, statusMessage: 'Missing ID token' })

    const adminAuth = getAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid
    const email = decoded.email || body.email || ''

    const db = getFirestore()
    const userRef = db.collection('users').doc(uid)
    const snap = await userRef.get()

    let now = new Date()
    let data: Partial<UserProfile>
    let created = false

    if (!snap.exists) {
      const trial = calculateTrialInfo(now)
      data = {
        uid,
        email,
        role: 'user',
        createdAt: now,
        lastLoginAt: now,
        subscription: { status: 'trial' as SubscriptionStatus },
        trial,
        preferences: { defaultLanguage: 'español', notifications: { productUpdates: false, languageTips: false } },
        preferencesUpdatedAt: now,
        emailVerified: true,
        isActive: true
      }
      await userRef.set({
        ...data,
        createdAt: now,
        lastLoginAt: now,
        preferencesUpdatedAt: FieldValue.serverTimestamp()
      } as any)
      created = true
    } else {
      // Ensure lastLoginAt is current; backfill default preferences if missing
      const current = snap.data() as any
      const update: any = { lastLoginAt: now }
      if (!current.preferences) {
        update.preferences = { defaultLanguage: 'español', notifications: { productUpdates: false, languageTips: false } }
        update.preferencesUpdatedAt = FieldValue.serverTimestamp()
      }
      await userRef.update(update)
      data = { ...(snap.data() as any), lastLoginAt: now }
    }

    // Determine subscriptionStatus for claims
    const subscriptionStatus: SubscriptionStatus = (data as any)?.subscription?.status || 'trial'
    const claims = decoded as any
    const needsUpdate = claims?.role !== (data as any).role || claims?.subscriptionStatus !== subscriptionStatus
    if (needsUpdate) {
      await adminAuth.setCustomUserClaims(uid, {
        role: (data as any).role,
        subscriptionStatus
      })
    }

    // Return minimal profile (dates as JS Date)
    const user: UserProfile = {
      uid,
      email,
      displayName: (data as any).displayName,
      photoURL: (data as any).photoURL,
      role: (data as any).role,
      createdAt: (data as any).createdAt || now,
      lastLoginAt: now,
      subscription: (data as any).subscription || { status: 'trial' },
      trial: (data as any).trial || calculateTrialInfo(now),
      preferences: (data as any).preferences,
      emailVerified: true,
      isActive: true
    }

    return { success: true, user, claimsUpdated: needsUpdate }
  } catch (e: any) {
    // Surface useful info without leaking internals
    throw createError({ statusCode: e?.statusCode || 500, statusMessage: e?.statusMessage || 'post-sign-in failed' })
  }
})
