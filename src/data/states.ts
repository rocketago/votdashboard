import type { TargetType } from './tiers'
import {
  TARGET_STATES,
  stateTargetTypes,
  targetDistrictsIn,
  targetsIn,
  type Target,
} from './targets'
import { chaptersIn } from './chapters'
import { reportFor } from './reports'

/**
 * Whether a state has a chartered chapter. Derived from the Airtable roster, which
 * records chapters that exist — so there is no in-development state between the two.
 */
export type ChapterStatus = 'established' | 'none'


export interface StateRecord {
  abbr: string
  name: string
  /** Union of the state's targets' designations, ranked (Soft > Hard > Development). */
  types: TargetType[]
  /** Dominant designation — the first of `types`. Drives the state's solid fill. */
  tier: TargetType
  /** Every target in the state: Senate, statewide and House. */
  targets: Target[]
  /** Target House districts as full ids, e.g. `['OH-01','OH-09','OH-13']`. */
  districts: string[]
  chapter: ChapterStatus
  /** Chartered chapters in the state, from the Airtable roster. */
  chapters: number
  /** Voter registrations reported to date. */
  reg: number
  /** Pledges to vote reported to date. */
  pledge: number
  /** Students engaged, reported to date. */
  students: number
}

export const STATE_NAME: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

/**
 * The board: one record per state carrying at least one target, with placeholder
 * metrics resolved. A state with no targets is absent, and the detail panel treats it
 * as "not on the target board".
 */
export const STATES: Record<string, StateRecord> = Object.fromEntries(
  TARGET_STATES.map((abbr) => {
    const types = stateTargetTypes(abbr)

    // Real data, from Airtable, which records chapters that exist — so a state either
    // has chapters or it does not. Anything in development lives in the Start a Chapter
    // Requests table and is not synced.
    const chapters = chaptersIn(abbr)
    const chapter: ChapterStatus = chapters.length ? 'established' : 'none'

    return [
      abbr,
      {
        abbr,
        name: STATE_NAME[abbr] ?? abbr,
        types,
        tier: types[0]!,
        targets: targetsIn(abbr),
        districts: targetDistrictsIn(abbr),
        chapter,
        chapters: chapters.length,
        ...reportFor(abbr),
      } satisfies StateRecord,
    ]
  }),
)

/** Chapter-status presentation: label and dot colour. */
export const CHAPTER_STATUS: Record<ChapterStatus, { label: string; color: string }> = {
  established: { label: 'Established chapter', color: 'var(--chapter)' },
  none: { label: 'No chapter yet', color: '#4a5566' },
}

/** `'OH-09'` -> `'09'`. Districts carry their state prefix for readability. */
export function districtNumber(id: string): string {
  return id.split('-')[1] ?? id
}
