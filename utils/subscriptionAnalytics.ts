/**
 * Subscription analytics utilities
 * Minimal abstraction layer so the app can wire to any analytics backend later.
 */

type EventPayload = Record<string, any>

function send(event: string, payload: EventPayload = {}) {
  // TODO: Integrate with actual analytics provider
  // eslint-disable-next-line no-console
  console.log(`[analytics] ${event}`, payload)
}

export function trackPaywallView(source: string, feature?: string) {
  send('paywall_view', { source, feature, ts: Date.now() })
}

export function trackAccessDenied(resource: string, reason: string) {
  send('access_denied', { resource, reason, ts: Date.now() })
}

export function trackTrialExpiration(uid?: string) {
  send('trial_expiration', { uid, ts: Date.now() })
}

export function trackSubscriptionConversion(planId?: string, source?: string) {
  send('subscription_conversion', { planId, source, ts: Date.now() })
}

