/**
 * Story Bank data model.
 *
 * Future Airtable sync: source table is the EXISTING "Fellow Reports" table
 * in the VOT 2026 Soft Side Reports base (appwnA2eTd4GfxZWE, tbll3QFJsbGVvU4w0).
 * Sync mapping:
 *   - "Name" (singleLineText) → story.name
 *   - "What's one conversation with a voter that stood out this week?" (multilineText) → story.quote
 *   - "Where did this happen?" (singleLineText) → story.location
 *   - "Your State" (multipleRecordLinks) → story.scope.state (resolved to abbr)
 *   - Category is always fellow_report for rows sourced from this form.
 *
 * Non-fellow categories (volunteer_story, campus_story, etc.) come from other sources
 * and do not carry a location field.
 */

export type StoryCategory =
  | 'volunteer_story'
  | 'campus_story'
  | 'organizer_story'
  | 'voter_story'
  | 'fellow_report'

export const STORY_CATEGORY_LABEL: Record<StoryCategory, string> = {
  volunteer_story: 'Volunteer',
  campus_story: 'Campus',
  organizer_story: 'Organizer',
  voter_story: 'Voter',
  fellow_report: 'Fellow',
}

export const STORY_CATEGORY_ORDER: readonly StoryCategory[] = [
  'fellow_report',
  'volunteer_story',
  'campus_story',
  'organizer_story',
  'voter_story',
] as const

export interface StoryScope {
  /** Two-letter state abbreviation. */
  state: string
}

export interface Story {
  id: string
  name: string
  quote: string
  scope: StoryScope
  /** Freeform "Where did this happen?" text. Present on fellow_report stories; absent on others. */
  location?: string
  category: StoryCategory
}

export { STORIES } from './stories.data'
