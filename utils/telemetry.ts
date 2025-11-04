export type TelemetryPayload = Record<string, any> | undefined

let lastEvent: { name: string; payload?: TelemetryPayload; ts: number } | null = null

export const track = (name: string, payload?: TelemetryPayload) => {
  lastEvent = { name, payload, ts: Date.now() }
  if (process.dev) {
    // Keep it lightweight in development
    // eslint-disable-next-line no-console
    console.debug(`🔎 telemetry: ${name}`, payload ?? {})
  }
}

export const getLastEvent = () => lastEvent

