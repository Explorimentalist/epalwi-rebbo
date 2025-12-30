/**
 * Debug Subscription Validation Endpoint
 * Tests the exact same validation flow as dictionary endpoint
 * GET /api/debug-subscription
 */

import { validateUserSubscription } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Debug [debug-subscription]: Starting subscription validation test')
    
    // This is the exact same call that the dictionary endpoint makes
    const authResult = await validateUserSubscription(event)
    
    console.log('🔧 Debug [debug-subscription]: Validation result:', authResult.success)
    
    if (!authResult.success) {
      console.log('❌ Debug [debug-subscription]: Validation failed:', authResult.error)
      console.log('❌ Debug [debug-subscription]: Error code:', authResult.errorCode)
      
      return {
        success: false,
        testResult: 'VALIDATION_FAILED',
        error: authResult.error,
        errorCode: authResult.errorCode,
        timestamp: new Date().toISOString()
      }
    }
    
    console.log('✅ Debug [debug-subscription]: Validation successful')
    console.log('✅ Debug [debug-subscription]: User info available:', !!authResult.user)
    
    const user = authResult.user!
    
    return {
      success: true,
      testResult: 'VALIDATION_SUCCESS',
      userInfo: {
        uid: user.uid?.substring(0, 8) + '...',
        email: user.email,
        hasActiveSubscription: user.hasActiveSubscription,
        isTrialActive: user.isTrialActive,
        isInGracePeriod: user.isInGracePeriod,
        canAccessFeatures: user.canAccessFeatures,
        subscriptionStatus: user.subscriptionStatus,
        trialDaysRemaining: user.trialDaysRemaining
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error: any) {
    console.error('❌ Debug [debug-subscription]: Unexpected error:', error)
    console.error('❌ Debug [debug-subscription]: Error stack:', error.stack)
    
    return {
      success: false,
      testResult: 'UNEXPECTED_ERROR',
      error: error.message,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    }
  }
})