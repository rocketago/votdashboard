/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-airtable.mjs` from the "Campuses" table in the VOT 2026 Soft Side Reports base.
 * Re-run `npm run sync` to refresh it.
 *
 * The campuses that will carry fellows. Each is linked to a target district in
 * Airtable, and the district name is where the state comes from — the table itself has
 * no state column.
 *
 * Airtable records a campus by name only, so coordinates are geocoded in the sync script
 * rather than stored here. A campus it has no entry for is listed but not drawn.
 */

import { STATES } from './states'
import type { TargetType } from './tiers'

export interface Campus {
  name: string
  /** USPS abbreviation, taken from the district the campus is linked to. */
  state: string
  /** Target district the campus sits in, e.g. `'VA-05'`. */
  district: string
  /** Approximate campus centroid. Absent until Airtable carries coordinates. */
  lat?: number
  lon?: number
  /**
   * Radius in degrees of latitude, on a community chapter only. It covers a city or a
   * region rather than sitting at a point, so it is drawn as that area.
   */
  radius?: number
}

export const CAMPUSES: Campus[] = [
  { name: "Saint Ambrose University", state: 'IA', district: 'IA-01', lat: 41.5398, lon: -90.5812 },
  { name: "University of Iowa", state: 'IA', district: 'IA-01', lat: 41.6311, lon: -91.5408 },
  { name: "Drake University", state: 'IA', district: 'IA-03', lat: 41.6031, lon: -93.6553 },
  { name: "Grand View University", state: 'IA', district: 'IA-03', lat: 41.6198, lon: -93.5988 },
  { name: "Liberty University", state: 'VA', district: 'VA-05', lat: 37.3539, lon: -79.1532 },
  { name: "Longwood University", state: 'VA', district: 'VA-05', lat: 37.309, lon: -78.4017 },
  { name: "Lynchburg University", state: 'VA', district: 'VA-05', lat: 37.3987, lon: -79.184 },
  { name: "Randolph College", state: 'VA', district: 'VA-05', lat: 37.4393, lon: -79.1709 },
  { name: "University of Virginia", state: 'VA', district: 'VA-05', lat: 38.0411, lon: -78.5055 },
  { name: "Virginia University of Lynchburg", state: 'VA', district: 'VA-05', lat: 37.3951, lon: -79.1528 },
]

/**
 * A campus dot takes its state's dominant target type, so campus colouring can never
 * drift out of step with the board the way a hand-assigned tier would.
 */
export function campusType(campus: Campus): TargetType {
  return STATES[campus.state]?.tier ?? 'dev'
}

/** A campus with coordinates — the only kind the map can place. */
export type MappedCampus = Campus & { lat: number; lon: number }

const hasCoords = (c: Campus): c is MappedCampus =>
  c.lat !== undefined && c.lon !== undefined

/** Campuses that can actually be drawn. Empty until Airtable carries coordinates. */
export const MAPPABLE_CAMPUSES: MappedCampus[] = CAMPUSES.filter(hasCoords)

const BY_STATE = CAMPUSES.reduce<Record<string, Campus[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

export const campusesIn = (abbr: string): Campus[] => BY_STATE[abbr] ?? []

/** Campuses in a state that can be drawn, as opposed to merely listed. */
export const mappableCampusesIn = (abbr: string): MappedCampus[] =>
  campusesIn(abbr).filter(hasCoords)
