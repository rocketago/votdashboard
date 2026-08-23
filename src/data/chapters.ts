/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-chapters.mjs` from the "Chapter Management" table in the
 * VOT Chapters Airtable base. Re-run `npm run chapters` to refresh it.
 *
 * This is the real chapter roster, unlike most of `src/data/`. Chapter status and
 * counts in `states.ts` are derived from it rather than hand-set.
 *
 * Airtable carries no coordinates for these — `Campus Zip` is populated on a handful
 * of records — so chapters are listed, not mapped. The campus pins on the map still
 * come from the placeholder list in `campuses.ts`.
 */

/** Airtable's `Chapter Type`. Only colleges are filed as Campus. */
export type ChapterKind = 'campus' | 'community'

/** Airtable's `Campus Type` — what the chapter is attached to. */
export type ChapterSetting = 'college' | 'high-school' | 'community' | 'state'

export interface Chapter {
  name: string
  /** USPS abbreviation of the state the chapter is in. */
  state: string
  kind: ChapterKind
  setting: ChapterSetting
}

export const CHAPTERS: Chapter[] = [
  { name: "Calabasas High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "California", state: 'CA', kind: 'community', setting: 'state' },
  { name: "Campolindo High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Canyon High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Cerritos College", state: 'CA', kind: 'campus', setting: 'college' },
  { name: "Cerritos High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Del Norte High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Head-Royce School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Hoover High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Los Angeles", state: 'CA', kind: 'community', setting: 'community' },
  { name: "Martin Luther King High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Pioneer High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "San Francisco", state: 'CA', kind: 'community', setting: 'community' },
  { name: "University of California-Berkeley", state: 'CA', kind: 'campus', setting: 'college' },
  { name: "University of California-Los Angeles", state: 'CA', kind: 'campus', setting: 'college' },
  { name: "DC", state: 'DC', kind: 'community', setting: 'state' },
  { name: "George Washington University", state: 'DC', kind: 'campus', setting: 'college' },
  { name: "Central Florida", state: 'FL', kind: 'community', setting: 'community' },
  { name: "Florida", state: 'FL', kind: 'community', setting: 'state' },
  { name: "Florida Atlantic University", state: 'FL', kind: 'campus', setting: 'college' },
  { name: "New College of Florida", state: 'FL', kind: 'campus', setting: 'college' },
  { name: "Rollins College", state: 'FL', kind: 'campus', setting: 'college' },
  { name: "University of Central Florida", state: 'FL', kind: 'campus', setting: 'college' },
  { name: "University of Miami", state: 'FL', kind: 'campus', setting: 'college' },
  { name: "University of South Florida", state: 'FL', kind: 'campus', setting: 'college' },
  { name: "University of Tampa", state: 'FL', kind: 'campus', setting: 'college' },
  { name: "Atlanta", state: 'GA', kind: 'community', setting: 'community' },
  { name: "Georgia Institute of Technology", state: 'GA', kind: 'campus', setting: 'college' },
  { name: "Georgia State University", state: 'GA', kind: 'campus', setting: 'college' },
  { name: "Illinois", state: 'IL', kind: 'community', setting: 'state' },
  { name: "Indiana University-Bloomington", state: 'IN', kind: 'campus', setting: 'college' },
  { name: "Kansas", state: 'KS', kind: 'community', setting: 'state' },
  { name: "Boston", state: 'MA', kind: 'community', setting: 'community' },
  { name: "University of Massachusetts-Amherst", state: 'MA', kind: 'campus', setting: 'college' },
  { name: "Maryland", state: 'MD', kind: 'community', setting: 'state' },
  { name: "Eureka High School", state: 'MO', kind: 'community', setting: 'high-school' },
  { name: "Cary Academy", state: 'NC', kind: 'community', setting: 'high-school' },
  { name: "Raleigh", state: 'NC', kind: 'community', setting: 'community' },
  { name: "New York City", state: 'NY', kind: 'community', setting: 'community' },
  { name: "Westhampton Beach High School", state: 'NY', kind: 'community', setting: 'high-school' },
  { name: "Cleveland", state: 'OH', kind: 'community', setting: 'community' },
  { name: "Oklahoma", state: 'OK', kind: 'community', setting: 'state' },
  { name: "Oregon", state: 'OR', kind: 'community', setting: 'state' },
  { name: "Penn State University", state: 'PA', kind: 'campus', setting: 'college' },
  { name: "Hampton University", state: 'VA', kind: 'campus', setting: 'college' },
  { name: "Northern Virginia", state: 'VA', kind: 'community', setting: 'community' },
  { name: "Richard Bland College", state: 'VA', kind: 'campus', setting: 'college' },
  { name: "Virginia", state: 'VA', kind: 'community', setting: 'state' },
  { name: "Seattle", state: 'WA', kind: 'community', setting: 'community' },
]

const BY_STATE = CHAPTERS.reduce<Record<string, Chapter[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

/** Every chapter in a state, alphabetically. Empty where there are none. */
export const chaptersIn = (abbr: string): Chapter[] => BY_STATE[abbr] ?? []

/** How a chapter's setting reads in the UI. */
export const SETTING_LABEL: Record<ChapterSetting, string> = {
  college: 'college',
  'high-school': 'high school',
  community: 'community',
  state: 'statewide',
}
