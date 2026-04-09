/**
 * Debug User Lookup Endpoint
 * Tests specific user record lookup with actual user ID
 * GET /api/debug-user-lookup?uid=USER_ID
 */

import { getUserById, getUserSubscriptionStatus } from '~/server/utils/database'
import { getUserSubscriptionStatus as getAuthUserSubscription } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Debug [debug-user-lookup]: Starting user lookup test')
    
    // Get UID from query or use default test UID
    const query = getQuery(event)
    const testUid = (query.uid as string) || 'fe42b058-caa4-4161-b89b-f48377c63889'
    
    console.log('🔧 Debug [debug-user-lookup]: Testing UID:', testUid)
    
    const result = {
      timestamp: new Date().toISOString(),
      testUid,
      getUserByIdTest: 'NOT_TESTED',
      getUserSubscriptionStatusTest: 'NOT_TESTED',
      error: null as string | null,
      userRecord: null as any,
      subscriptionInfo: null as any
    }
    
    // Test 1: Basic user lookup
    console.log('🔧 Debug [debug-user-lookup]: Testing getUserById...')
    try {
      const user = await getUserById(testUid)
      result.getUserByIdTest = user ? 'FOUND' : 'NOT_FOUND'
      result.userRecord = user ? {
        uid: user.uid,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        subscription: user.subscription,
        trial: user.trial
      } : null
      
      console.log('✅ Debug [debug-user-lookup]: getUserById result:', result.getUserByIdTest)
    } catch (userError: any) {
      result.getUserByIdTest = 'ERROR'
      result.error = userError.message
      console.error('❌ Debug [debug-user-lookup]: getUserById failed:', userError.message)
      return { success: false, debug: result }
    }
    
    // Test 2: Subscription status lookup (the one that's actually failing)
    console.log('🔧 Debug [debug-user-lookup]: Testing getUserSubscriptionStatus...')
    try {
      const subscriptionInfo = await getAuthUserSubscription(testUid)
      result.getUserSubscriptionStatusTest = 'SUCCESS'
      result.subscriptionInfo = {
        uid: subscriptionInfo.uid,
        email: subscriptionInfo.email,
        hasActiveSubscription: subscriptionInfo.hasActiveSubscription,
        isTrialActive: subscriptionInfo.isTrialActive,
        isInGracePeriod: subscriptionInfo.isInGracePeriod,
        canAccessFeatures: subscriptionInfo.canAccessFeatures,
        subscriptionStatus: subscriptionInfo.subscriptionStatus,
        trialDaysRemaining: subscriptionInfo.trialDaysRemaining,
        graceDaysRemaining: subscriptionInfo.graceDaysRemaining
      }
      
      console.log('✅ Debug [debug-user-lookup]: getUserSubscriptionStatus successful')
    } catch (subscriptionError: any) {
      result.getUserSubscriptionStatusTest = 'ERROR'
      result.subscriptionError = subscriptionError.message
      result.subscriptionErrorType = subscriptionError.constructor.name
      result.subscriptionErrorStack = subscriptionError.stack
      console.error('❌ Debug [debug-user-lookup]: getUserSubscriptionStatus failed:', subscriptionError.message)
      console.error('❌ Debug [debug-user-lookup]: Error stack:', subscriptionError.stack)
    }
    
    return { success: true, debug: result }
    
  } catch (error: any) {
    console.error('❌ Debug [debug-user-lookup]: Unexpected error:', error)
    return {
      success: false,
      debug: {
        timestamp: new Date().toISOString(),
        error: error.message,
        errorType: error.constructor.name,
        stack: error.stack
      }
    }
  }
})