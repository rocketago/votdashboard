import type { TargetType } from './tiers'

export interface Campus {
  name: string
  lat: number
  lon: number
  /** State abbreviation, keys into `STATES`. */
  state: string
  /** True where a chapter is chartered on campus; false where it is a prospect. */
  hasChapter: boolean
  /** The campus programme's own target classification, independent of its state's. */
  type: TargetType
}

/**
 * PLACEHOLDER DATA. Campus list and coordinates were assigned during design.
 * Coordinates are approximate campus centroids.
 */
export const CAMPUSES: Campus[] = [
  { name: 'Arizona State', lat: 33.42, lon: -111.93, state: 'AZ', hasChapter: true, type: 'hard' },
  { name: 'U of Arizona', lat: 32.23, lon: -110.95, state: 'AZ', hasChapter: true, type: 'hard' },
  { name: 'U of Georgia', lat: 33.95, lon: -83.38, state: 'GA', hasChapter: true, type: 'hard' },
  { name: 'Georgia State', lat: 33.75, lon: -84.39, state: 'GA', hasChapter: true, type: 'hard' },
  { name: 'U of Michigan', lat: 42.28, lon: -83.74, state: 'MI', hasChapter: true, type: 'hard' },
  { name: 'Michigan State', lat: 42.72, lon: -84.48, state: 'MI', hasChapter: true, type: 'hard' },
  { name: 'Wayne State', lat: 42.36, lon: -83.07, state: 'MI', hasChapter: false, type: 'hard' },
  { name: 'UNC Chapel Hill', lat: 35.91, lon: -79.05, state: 'NC', hasChapter: true, type: 'hard' },
  { name: 'NC State', lat: 35.78, lon: -78.68, state: 'NC', hasChapter: true, type: 'hard' },
  { name: 'UNLV', lat: 36.11, lon: -115.14, state: 'NV', hasChapter: true, type: 'hard' },
  { name: 'U of Nevada Reno', lat: 39.54, lon: -119.82, state: 'NV', hasChapter: false, type: 'hard' },
  { name: 'Penn State', lat: 40.8, lon: -77.86, state: 'PA', hasChapter: true, type: 'hard' },
  { name: 'Temple', lat: 39.98, lon: -75.16, state: 'PA', hasChapter: true, type: 'hard' },
  { name: 'UW–Madison', lat: 43.08, lon: -89.4, state: 'WI', hasChapter: true, type: 'hard' },
  { name: 'UT Austin', lat: 30.29, lon: -97.74, state: 'TX', hasChapter: true, type: 'hard' },
  { name: 'Texas A&M', lat: 30.61, lon: -96.34, state: 'TX', hasChapter: false, type: 'hard' },
  { name: 'UT San Antonio', lat: 29.58, lon: -98.62, state: 'TX', hasChapter: true, type: 'hard' },

  { name: 'CU Boulder', lat: 40.01, lon: -105.27, state: 'CO', hasChapter: true, type: 'soft' },
  { name: 'U of Florida', lat: 29.65, lon: -82.34, state: 'FL', hasChapter: true, type: 'soft' },
  { name: 'Florida Int’l', lat: 25.76, lon: -80.37, state: 'FL', hasChapter: true, type: 'soft' },
  { name: 'U of Minnesota', lat: 44.97, lon: -93.24, state: 'MN', hasChapter: true, type: 'soft' },
  { name: 'UNH Durham', lat: 43.14, lon: -70.93, state: 'NH', hasChapter: false, type: 'soft' },
  { name: 'Ohio State', lat: 40.0, lon: -83.02, state: 'OH', hasChapter: true, type: 'soft' },
  { name: 'Virginia Tech', lat: 37.23, lon: -80.42, state: 'VA', hasChapter: false, type: 'soft' },
  { name: 'UVA', lat: 38.03, lon: -78.51, state: 'VA', hasChapter: true, type: 'soft' },
  { name: 'Iowa State', lat: 42.03, lon: -93.65, state: 'IA', hasChapter: false, type: 'soft' },
  { name: 'U of New Mexico', lat: 35.08, lon: -106.62, state: 'NM', hasChapter: false, type: 'soft' },

  { name: 'UCLA', lat: 34.07, lon: -118.44, state: 'CA', hasChapter: true, type: 'dev' },
  { name: 'UC Berkeley', lat: 37.87, lon: -122.26, state: 'CA', hasChapter: true, type: 'dev' },
  { name: 'Hunter College', lat: 40.77, lon: -73.96, state: 'NY', hasChapter: true, type: 'dev' },
  { name: 'U of Illinois', lat: 40.1, lon: -88.23, state: 'IL', hasChapter: true, type: 'dev' },
  { name: 'U of Washington', lat: 47.66, lon: -122.31, state: 'WA', hasChapter: true, type: 'dev' },
  { name: 'Portland State', lat: 45.51, lon: -122.68, state: 'OR', hasChapter: false, type: 'dev' },
  { name: 'Rutgers', lat: 40.5, lon: -74.45, state: 'NJ', hasChapter: true, type: 'dev' },
  { name: 'U of Kansas', lat: 38.95, lon: -95.25, state: 'KS', hasChapter: false, type: 'dev' },
]

const BY_STATE = CAMPUSES.reduce<Record<string, Campus[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

export const campusesIn = (abbr: string): Campus[] => BY_STATE[abbr] ?? []
