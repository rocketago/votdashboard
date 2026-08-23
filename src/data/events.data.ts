/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-airtable.mjs` from the "Event Tracker (Org-Wide)" table in the VOT 2026 Soft Side Reports base.
 * Re-run `npm run sync` to refresh it.
 *
 * Only the event rows live here; the calendar's types and date helpers are
 * hand-written in `events.ts`, which re-exports this list.
 *
 * An event targeting races in more than one state appears once per state, so it reaches
 * every organiser it concerns.
 *
 * Dates and times are Eastern, converted at sync time so nothing depends on the
 * reader's timezone.
 */

import type { ProgramEvent } from './events'

export const EVENTS: ProgramEvent[] = []
