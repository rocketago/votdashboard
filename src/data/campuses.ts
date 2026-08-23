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
 * There are no coordinates: Airtable records a campus by name only. `lat`/`lon` are
 * therefore optional and currently unset on every record, and the map skips any campus
 * without them. Adding those two fields in Airtable is what would put these on the map.
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
}

export const CAMPUSES: Campus[] = [
  { name: "Saint Ambrose University", state: 'IA', district: 'IA-01' },
  { name: "University of Iowa", state: 'IA', district: 'IA-01' },
  { name: "Drake University", state: 'IA', district: 'IA-03' },
  { name: "Grand View University", state: 'IA', district: 'IA-03' },
  { name: "Liberty University", state: 'VA', district: 'VA-05' },
  { name: "Longwood University", state: 'VA', district: 'VA-05' },
  { name: "Lynchburg University", state: 'VA', district: 'VA-05' },
  { name: "Randolph College", state: 'VA', district: 'VA-05' },
  { name: "University of Virginia", state: 'VA', district: 'VA-05' },
  { name: "Virginia University of Lynchburg", state: 'VA', district: 'VA-05' },
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
