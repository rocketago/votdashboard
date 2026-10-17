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
  { name: "Emma Jenson", quote: "I was talking to a future educator who was telling me how scared she was to see what our classroom turn into. With the don’t say gay bill, book bans, and individual district guidelines have made it so much harder to be the best educator you can be. She was telling me how sad it is we have to inform parents if a student wants to go by a different name or pronouns.", location: "University of Northern Iowa Campus", scopes: [{ state: 'IA', districts: [] }], category: 'fellow_report' },
  { name: "Jocelyn Loveless", quote: "A student wasn't sure about registering to vote for Black Hawk County since they are already registered in their hometown and aren't sure about their future plans, and I discussed with them their options for absentee voting and what the process would be like to register in BHC.", location: "UNI campus", scopes: [{ state: 'IA', districts: [] }], category: 'fellow_report' },
  { name: "Schaler Starks", quote: "One voter said they did not feel fulfilled working in healthcare due to the issues in accessibility by immigrant residents and uninsured patients.", location: "University of Iowa Campus, Tailgates", scopes: [{ state: 'IA', districts: [] }], category: 'fellow_report' },
  { name: "Athena Ash", quote: "I talked with some international students about the voting process in the US and they had a lot of questions and options. It was a very interesting conversation overall.", location: "university of virginia", scopes: [{ state: 'VA', districts: [] }], category: 'fellow_report' },
  { name: "Lily Brame", quote: "A girl was wondering whether or not to switch her registration and she was having a hard time deciding where her vote would matter more, since she felt it was wasted in Florida.", location: "University of Virginia", scopes: [{ state: 'VA', districts: [] }], category: 'fellow_report' },
  { name: "Orion Myers-Ramirez", quote: "I spoke with Anthony and gained the emails of many of the names listed above.", location: "Longwood University", scopes: [{ state: 'VA', districts: [] }], category: 'fellow_report' },
]
