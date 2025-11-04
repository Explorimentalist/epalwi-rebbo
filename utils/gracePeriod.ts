/**
 * Grace period utilities
 * Provides helpers to determine if a user is in grace period and how many days remain.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Normalize input into a Date instance */
export function toDate(input: Date | string | number): Date {
  if (input instanceof Date) return input
  const d = new Date(input)
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date input')
  }
  return d
}

/**
 * Returns true if now is after trialEndDate and before or equal to trialEndDate + graceDays.
 * Defaults to a 3-day grace period.
 */
export function isInGracePeriod(
  trialEndDate: Date | string | number,
  now: Date = new Date(),
  graceDays = 3
): boolean {
  const end = toDate(trialEndDate)
  const graceEnd = new Date(end.getTime() + graceDays * MS_PER_DAY)
  return now > end && now <= graceEnd
}

/**
 * Returns ceil of days remaining in grace period, min 0. Defaults to 3-day grace.
 */
export function getGraceDaysRemaining(
  trialEndDate: Date | string | number,
  now: Date = new Date(),
  graceDays = 3
): number {
  const end = toDate(trialEndDate)
  const graceEnd = new Date(end.getTime() + graceDays * MS_PER_DAY)
  const msRemaining = graceEnd.getTime() - now.getTime()
  const days = Math.ceil(msRemaining / MS_PER_DAY)
  return Math.max(0, days)
}

