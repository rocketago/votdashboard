import { STATES } from './states'
import type { TargetType } from './tiers'

export interface Campus {
  name: string
  lat: number
  lon: number
  /** State abbreviation. The campus only renders when its state is on the board. */
  state: string
}

/**
 * PLACEHOLDER DATA. Campus list was assigned during design; coordinates are approximate
 * campus centroids. None of it is confirmed, so the panel labels these "unconfirmed"
 * rather than presenting them as programmes we run.
 *
 * These used to carry a `hasChapter` flag. It is gone: `chapters.ts` is synced from
 * Airtable and is the only source of truth about what is chartered. A hand-maintained
 * second answer to that question could only ever drift out of date, and had — it
 * claimed a Temple chapter that does not exist, and listed Penn State twice under two
 * spellings.
 *
 * Campuses in states that are not currently targeted are kept here rather than deleted —
 * they simply do not draw, and reappear if their state returns to the board.
 */
export const CAMPUSES: Campus[] = [
  { name: 'Arizona State', lat: 33.42, lon: -111.93, state: 'AZ' },
  { name: 'U of Arizona', lat: 32.23, lon: -110.95, state: 'AZ' },
  { name: 'U of Georgia', lat: 33.95, lon: -83.38, state: 'GA' },
  { name: 'Georgia State', lat: 33.75, lon: -84.39, state: 'GA' },
  { name: 'U of Michigan', lat: 42.28, lon: -83.74, state: 'MI' },
  { name: 'Michigan State', lat: 42.72, lon: -84.48, state: 'MI' },
  { name: 'Wayne State', lat: 42.36, lon: -83.07, state: 'MI' },
  { name: 'UNC Chapel Hill', lat: 35.91, lon: -79.05, state: 'NC' },
  { name: 'NC State', lat: 35.78, lon: -78.68, state: 'NC' },
  { name: 'UNLV', lat: 36.11, lon: -115.14, state: 'NV' },
  { name: 'U of Nevada Reno', lat: 39.54, lon: -119.82, state: 'NV' },
  { name: 'Penn State', lat: 40.8, lon: -77.86, state: 'PA' },
  { name: 'Temple', lat: 39.98, lon: -75.16, state: 'PA' },
  { name: 'UW–Madison', lat: 43.08, lon: -89.4, state: 'WI' },
  { name: 'UT Austin', lat: 30.29, lon: -97.74, state: 'TX' },
  { name: 'Texas A&M', lat: 30.61, lon: -96.34, state: 'TX' },
  { name: 'UT San Antonio', lat: 29.58, lon: -98.62, state: 'TX' },

  { name: 'CU Boulder', lat: 40.01, lon: -105.27, state: 'CO' },
  { name: 'U of Florida', lat: 29.65, lon: -82.34, state: 'FL' },
  { name: 'Florida Int’l', lat: 25.76, lon: -80.37, state: 'FL' },
  { name: 'U of Minnesota', lat: 44.97, lon: -93.24, state: 'MN' },
  { name: 'UNH Durham', lat: 43.14, lon: -70.93, state: 'NH' },
  { name: 'Ohio State', lat: 40.0, lon: -83.02, state: 'OH' },
  { name: 'Virginia Tech', lat: 37.23, lon: -80.42, state: 'VA' },
  { name: 'UVA', lat: 38.03, lon: -78.51, state: 'VA' },
  { name: 'Iowa State', lat: 42.03, lon: -93.65, state: 'IA' },
  { name: 'U of New Mexico', lat: 35.08, lon: -106.62, state: 'NM' },

  { name: 'UCLA', lat: 34.07, lon: -118.44, state: 'CA' },
  { name: 'UC Berkeley', lat: 37.87, lon: -122.26, state: 'CA' },
  { name: 'Hunter College', lat: 40.77, lon: -73.96, state: 'NY' },
  { name: 'U of Illinois', lat: 40.1, lon: -88.23, state: 'IL' },
  { name: 'U of Washington', lat: 47.66, lon: -122.31, state: 'WA' },
  { name: 'Portland State', lat: 45.51, lon: -122.68, state: 'OR' },
  { name: 'Rutgers', lat: 40.5, lon: -74.45, state: 'NJ' },
  { name: 'U of Kansas', lat: 38.95, lon: -95.25, state: 'KS' },
]

/**
 * A campus dot takes its state's dominant target type, so campus colouring can never
 * drift out of step with the board the way a hand-assigned tier would.
 */
export function campusType(campus: Campus): TargetType {
  return STATES[campus.state]?.tier ?? 'dev'
}

const BY_STATE = CAMPUSES.reduce<Record<string, Campus[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

export const campusesIn = (abbr: string): Campus[] => BY_STATE[abbr] ?? []
