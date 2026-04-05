# Runbook: Stripe Webhook Monitoring and Alerting

## Scope
Operational guardrails for `POST /api/stripe/webhook`.

## Error Signals (7.1)
Track these as high-signal failures:
- Signature verification failures: log message `signature_verification_failed`
- Processing failures: log message `webhook_processing_failed`
- Any webhook HTTP status >= 500
- Stripe delivery retries rising for the webhook endpoint

## Correlation Strategy (7.3)
Every webhook log record should include:
- `requestId` (from `x-vercel-id` / `x-request-id` or generated UUID)
- `eventId` (Stripe event ID)
- `eventType`
- `userId` and/or `subscriptionId` when available
- `outcome`

Use `eventId` as the cross-system key between Stripe Dashboard and Vercel logs.

## Dashboard/Query Blueprint (7.4)
Create one operational dashboard or saved query that reports:
- Total events received
- Total successful events (`message=event_processed` and `outcome=success`)
- Total failed events (`message=webhook_processing_failed` or `signature_verification_failed`)
- Failure rate: `failed / total`
- Retry indicator from Stripe Dashboard for the same time window

## Suggested Alert Thresholds (7.2)
- Critical: failure rate >= 5% for 10 minutes
- Warning: >= 3 signature failures in 10 minutes
- Critical: any continuous 500s for 5 minutes

## Minimum Alert Routing
- Primary: on-call Slack channel
- Secondary: owner email
- Escalation: pager for sustained critical threshold

## Forced-Failure Test Plan (7.5)
1. Send a webhook request with an invalid signature in Stripe test mode.
2. Confirm `signature_verification_failed` appears in logs.
3. Confirm alert is triggered and delivered to configured destination.
4. Record evidence (timestamp, event id, screenshot, alert message link).

## Evidence Checklist
- Saved query/dashboard link
- Alert policy screenshot/config
- Test failure event ID + timestamp
- Vercel log excerpt with matching `requestId` and `eventId`

## Manual Commands (Optional)
- Tail Vercel logs for webhook path and filter structured messages.
- Correlate a Stripe event from Dashboard -> search same `eventId` in logs.
