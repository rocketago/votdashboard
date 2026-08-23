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
import {
  deriveMetrics,
  type ChapterStatus,
  type DerivedMetrics,
} from '../lib/metrics'

/**
 * Organizational facts about a state: whether there is a chapter, and who we work with.
 *
 * This is deliberately NOT where targeting lives — target types and target districts are
 * derived from `src/data/targets.ts`. Records are kept here for states that have since
 * come off the board, so their chapter and partner history is not lost; a state only
 * reappears on the map when a target is added back for it.
 *
 * PLACEHOLDER DATA: partner lists were assigned during design and have not been
 * confirmed. Chapter status is no longer here — it is derived from the real roster in
 * `chapters.ts`, so a state reads as having a chapter only if Airtable says so.
 */
export interface StateSource {
  partners: string[]
}

export const STATE_SOURCE: Record<string, StateSource> = {
  AZ: { partners: ['Arizona Youth Vote', 'Chispa AZ'] },
  GA: { partners: ['New Georgia Project', 'Georgia Shift'] },
  MI: { partners: ['MI Student Power', 'Detroit Action'] },
  NC: { partners: ['NC Black Alliance', 'Down Home NC'] },
  NV: { partners: ['Silver State Voices'] },
  PA: { partners: ['PA Youth Vote', 'Make the Road PA'] },
  WI: { partners: ['WI Youth Power', 'BLOC'] },
  TX: { partners: ['MOVE Texas', 'Jolt Initiative'] },

  FL: { partners: ['Florida Rising', 'Dream Defenders'] },
  OH: { partners: ['Ohio Student Assoc.'] },
  VA: { partners: ['New Virginia Majority'] },
  MN: { partners: ['MN Youth Collective'] },
  CO: { partners: ['New Era Colorado'] },
  NH: { partners: ['NH Youth Movement'] },
  NM: { partners: ['NM Native Vote'] },
  IA: { partners: [] },
  ME: { partners: ['Maine Youth Action'] },

  CA: { partners: ['CA Calls', 'Power CA Action'] },
  NJ: { partners: ['NJ Youth Power'] },
  NY: { partners: ['NY Youth Agenda'] },
  IL: { partners: ['Chicago Votes'] },
  WA: { partners: ['WA Youth Alliance'] },
  MA: { partners: ['MassVOTE'] },
  OR: { partners: ['Next Up Action'] },
  MD: { partners: [] },
  MO: { partners: [] },
  TN: { partners: ['The Equity Alliance'] },
  UT: { partners: [] },
  CT: { partners: [] },
  KS: { partners: [] },
  IN: { partners: [] },
  MT: { partners: [] },
  AK: { partners: [] },
  SC: { partners: [] },
  LA: { partners: [] },
  KY: { partners: [] },
  NE: { partners: [] },
  OK: { partners: [] },
  AL: { partners: [] },
}

export interface StateRecord extends DerivedMetrics {
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
  partners: string[]
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
    const source = STATE_SOURCE[abbr] ?? { partners: [] }
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
        partners: source.partners,
        ...deriveMetrics(abbr),
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
