import type { TargetType } from './tiers'
import {
  TARGET_STATES,
  stateTargetTypes,
  targetDistrictsIn,
  targetsIn,
  type Target,
} from './targets'
import { chaptersIn } from './chapters'
import {
  deriveMetrics,
  type ChapterStatus,
  type DerivedMetrics,
  type ScaleTier,
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
  /**
   * Legacy single-tier classification, kept only to scale the placeholder metrics (see
   * `src/lib/metrics.ts`) so that figures stay differentiated and stable. It encodes
   * nothing real — delete it along with the generator once measured numbers land.
   */
  scaleTier: ScaleTier
}

export const STATE_SOURCE: Record<string, StateSource> = {
  AZ: { scaleTier: 'priority', partners: ['Arizona Youth Vote', 'Chispa AZ'] },
  GA: { scaleTier: 'priority', partners: ['New Georgia Project', 'Georgia Shift'] },
  MI: { scaleTier: 'priority', partners: ['MI Student Power', 'Detroit Action'] },
  NC: { scaleTier: 'priority', partners: ['NC Black Alliance', 'Down Home NC'] },
  NV: { scaleTier: 'priority', partners: ['Silver State Voices'] },
  PA: { scaleTier: 'priority', partners: ['PA Youth Vote', 'Make the Road PA'] },
  WI: { scaleTier: 'priority', partners: ['WI Youth Power', 'BLOC'] },
  TX: { scaleTier: 'priority', partners: ['MOVE Texas', 'Jolt Initiative'] },

  FL: { scaleTier: 'soft', partners: ['Florida Rising', 'Dream Defenders'] },
  OH: { scaleTier: 'soft', partners: ['Ohio Student Assoc.'] },
  VA: { scaleTier: 'soft', partners: ['New Virginia Majority'] },
  MN: { scaleTier: 'soft', partners: ['MN Youth Collective'] },
  CO: { scaleTier: 'soft', partners: ['New Era Colorado'] },
  NH: { scaleTier: 'soft', partners: ['NH Youth Movement'] },
  NM: { scaleTier: 'soft', partners: ['NM Native Vote'] },
  IA: { scaleTier: 'soft', partners: [] },
  ME: { scaleTier: 'soft', partners: ['Maine Youth Action'] },

  CA: { scaleTier: 'nice', partners: ['CA Calls', 'Power CA Action'] },
  NJ: { scaleTier: 'nice', partners: ['NJ Youth Power'] },
  NY: { scaleTier: 'nice', partners: ['NY Youth Agenda'] },
  IL: { scaleTier: 'nice', partners: ['Chicago Votes'] },
  WA: { scaleTier: 'nice', partners: ['WA Youth Alliance'] },
  MA: { scaleTier: 'nice', partners: ['MassVOTE'] },
  OR: { scaleTier: 'nice', partners: ['Next Up Action'] },
  MD: { scaleTier: 'nice', partners: [] },
  MO: { scaleTier: 'nice', partners: [] },
  TN: { scaleTier: 'nice', partners: ['The Equity Alliance'] },
  UT: { scaleTier: 'nice', partners: [] },
  CT: { scaleTier: 'nice', partners: [] },
  KS: { scaleTier: 'nice', partners: [] },
  IN: { scaleTier: 'nice', partners: [] },
  MT: { scaleTier: 'nice', partners: [] },
  AK: { scaleTier: 'nice', partners: [] },
  SC: { scaleTier: 'nice', partners: [] },
  LA: { scaleTier: 'nice', partners: [] },
  KY: { scaleTier: 'nice', partners: [] },
  NE: { scaleTier: 'nice', partners: [] },
  OK: { scaleTier: 'nice', partners: [] },
  AL: { scaleTier: 'nice', partners: [] },
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
    const source = STATE_SOURCE[abbr] ?? { partners: [], scaleTier: 'nice' }
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
        partners: source.partners,
        ...deriveMetrics(abbr, source.scaleTier, chapter),
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
