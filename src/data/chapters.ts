/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-airtable.mjs` from the "Chapter Management" table in the VOT Chapters base.
 * Re-run `npm run sync` to refresh it.
 *
 * This is the real chapter roster, unlike most of `src/data/`. Chapter status and
 * counts in `states.ts` are derived from it rather than hand-set.
 *
 * Airtable carries no latitude or longitude. Chapters are placed anyway: a community one
 * over the city or region it covers, and a campus at
 * its ZIP. A chapter with no position is listed rather than drawn.
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
  /**
   * Where to draw it, when that is known. A statewide chapter sits at the centre of its
   * state and a community chapter at the centre of its city; schools have no coordinates
   * yet, and are listed rather than mapped.
   */
  lat?: number
  lon?: number
  /**
   * Radius in degrees of latitude, on a community chapter only. It covers a city or a
   * region rather than sitting at a point, so it is drawn as that area.
   */
  radius?: number
}

export const CHAPTERS: Chapter[] = [
  { name: "Calabasas High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "California", state: 'CA', kind: 'community', setting: 'state' },
  { name: "Campolindo High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Canyon High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Cerritos College", state: 'CA', kind: 'campus', setting: 'college', lat: 33.9063, lon: -118.0886 },
  { name: "Cerritos High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Del Norte High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Head-Royce School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Hoover High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Los Angeles", state: 'CA', kind: 'community', setting: 'community', lat: 33.9984, lon: -118.4117, radius: 0.339 },
  { name: "Martin Luther King High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "Pioneer High School", state: 'CA', kind: 'community', setting: 'high-school' },
  { name: "San Francisco", state: 'CA', kind: 'community', setting: 'community', lat: 37.785, lon: -122.7276, radius: 0.353 },
  { name: "University of California-Berkeley", state: 'CA', kind: 'campus', setting: 'college', lat: 37.8732, lon: -122.2571 },
  { name: "University of California-Los Angeles", state: 'CA', kind: 'campus', setting: 'college', lat: 34.0614, lon: -118.4439 },
  { name: "DC", state: 'DC', kind: 'community', setting: 'state' },
  { name: "George Washington University", state: 'DC', kind: 'campus', setting: 'college', lat: 38.9101, lon: -77.0286 },
  { name: "Central Florida", state: 'FL', kind: 'community', setting: 'community', lat: 28.5421, lon: -81.379, radius: 0.85 },
  { name: "Florida", state: 'FL', kind: 'community', setting: 'state' },
  { name: "Florida Atlantic University", state: 'FL', kind: 'campus', setting: 'college', lat: 26.3764, lon: -80.1039 },
  { name: "New College of Florida", state: 'FL', kind: 'campus', setting: 'college', lat: 27.4031, lon: -82.5221 },
  { name: "Rollins College", state: 'FL', kind: 'campus', setting: 'college', lat: 28.5989, lon: -81.3497 },
  { name: "University of Central Florida", state: 'FL', kind: 'campus', setting: 'college', lat: 28.6023, lon: -81.1995 },
  { name: "University of Miami", state: 'FL', kind: 'campus', setting: 'college', lat: 25.7207, lon: -80.2722 },
  { name: "University of South Florida", state: 'FL', kind: 'campus', setting: 'college', lat: 28.0628, lon: -82.4137 },
  { name: "University of Tampa", state: 'FL', kind: 'campus', setting: 'college', lat: 27.9366, lon: -82.4674 },
  { name: "Atlanta", state: 'GA', kind: 'community', setting: 'community', lat: 33.7674, lon: -84.4202, radius: 0.12 },
  { name: "Georgia Institute of Technology", state: 'GA', kind: 'campus', setting: 'college', lat: 33.7747, lon: -84.3947 },
  { name: "Georgia State University", state: 'GA', kind: 'campus', setting: 'college', lat: 33.7539, lon: -84.3898 },
  { name: "Illinois", state: 'IL', kind: 'community', setting: 'state' },
  { name: "Indiana University-Bloomington", state: 'IN', kind: 'campus', setting: 'college', lat: 39.1681, lon: -86.5194 },
  { name: "Kansas", state: 'KS', kind: 'community', setting: 'state' },
  { name: "Boston", state: 'MA', kind: 'community', setting: 'community', lat: 42.3124, lon: -70.9979, radius: 0.143 },
  { name: "University of Massachusetts-Amherst", state: 'MA', kind: 'campus', setting: 'college', lat: 42.3832, lon: -72.5199 },
  { name: "Maryland", state: 'MD', kind: 'community', setting: 'state' },
  { name: "Eureka High School", state: 'MO', kind: 'community', setting: 'high-school' },
  { name: "Cary Academy", state: 'NC', kind: 'community', setting: 'high-school' },
  { name: "Raleigh", state: 'NC', kind: 'community', setting: 'community', lat: 35.8395, lon: -78.6449, radius: 0.141 },
  { name: "New York City", state: 'NY', kind: 'community', setting: 'community', lat: 40.6971, lon: -73.9795, radius: 0.221 },
  { name: "Westhampton Beach High School", state: 'NY', kind: 'community', setting: 'high-school' },
  { name: "Cleveland", state: 'OH', kind: 'community', setting: 'community', lat: 41.4975, lon: -81.7059, radius: 0.13 },
  { name: "Oklahoma", state: 'OK', kind: 'community', setting: 'state' },
  { name: "Oregon", state: 'OR', kind: 'community', setting: 'state' },
  { name: "Penn State University", state: 'PA', kind: 'campus', setting: 'college', lat: 40.8015, lon: -77.8615 },
  { name: "Hampton University", state: 'VA', kind: 'campus', setting: 'college', lat: 37.0218, lon: -76.3366 },
  { name: "Northern Virginia", state: 'VA', kind: 'community', setting: 'community', lat: 38.8156, lon: -77.2837, radius: 0.35 },
  { name: "Richard Bland College", state: 'VA', kind: 'campus', setting: 'college', lat: 37.2359, lon: -77.285 },
  { name: "Virginia", state: 'VA', kind: 'community', setting: 'state' },
  { name: "Seattle", state: 'WA', kind: 'community', setting: 'community', lat: 47.6076, lon: -122.3421, radius: 0.127 },
]

const BY_STATE = CHAPTERS.reduce<Record<string, Chapter[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

/** Every chapter in a state, alphabetically. Empty where there are none. */
export const chaptersIn = (abbr: string): Chapter[] => BY_STATE[abbr] ?? []

/** A chapter that can be drawn on a map. */
export type PlacedChapter = Chapter & { lat: number; lon: number }

const isPlaced = (c: Chapter): c is PlacedChapter =>
  c.lat !== undefined && c.lon !== undefined

/** Chapters in a state that carry a position. Schools do not, yet. */
export const placedChaptersIn = (abbr: string): PlacedChapter[] =>
  chaptersIn(abbr).filter(isPlaced)

/** How a chapter's setting reads in the UI. */
export const SETTING_LABEL: Record<ChapterSetting, string> = {
  college: 'college',
  'high-school': 'high school',
  community: 'community',
  state: 'statewide',
}
