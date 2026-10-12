/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-airtable.mjs` from the "Fellow Reports" table in the VOT 2026 Soft Side Reports base.
 * Re-run `npm run sync` to refresh it.
 *
 * Real fellow-report stories, sourced from the Fellow Reports form. Every story
 * sourced from this form gets `category: 'fellow_report'` — the form does not
 * ask about the fellow's role, so no finer category is assigned.
 *
 * Placeholder sample stories (volunteer, voter, campus, organizer) live in
 * `stories.sample.ts` and are merged in by `stories.ts` alongside this list.
 */

import type { Story } from './stories'

export const STORIES: Story[] = [
  { name: "Emma Jenson", quote: "I had a lot of conversations with people about the current state of our government. It was nice to hear everyones diffrent opions of things.", location: "University of Northern Iowa", scopes: [{ state: 'IA', districts: [] }], category: 'fellow_report' },
  { name: "Schaler Starks", quote: "One voter said they did not feel fulfilled working in healthcare due to the issues in accessibility by immigrant residents and uninsured patients.", location: "University of Iowa Campus, Tailgates", scopes: [{ state: 'IA', districts: [] }], category: 'fellow_report' },
  { name: "Orion Myers-Ramirez", quote: "I spoke with Anthony and gained the emails of many of the names listed above.", location: "Longwood University", scopes: [{ state: 'VA', districts: [] }], category: 'fellow_report' },
]
