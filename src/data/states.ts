import type { TargetType } from './tiers'
import {
  TARGET_STATES,
  stateTargetTypes,
  targetDistrictsIn,
  targetsIn,
  type Target,
} from './targets'
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
 * PLACEHOLDER DATA: chapter statuses and partner lists were assigned during design and
 * have not been confirmed.
 */
export interface StateSource {
  chapter: ChapterStatus
  partners: string[]
  /**
   * Legacy single-tier classification, kept only to scale the placeholder metrics (see
   * `src/lib/metrics.ts`) so that figures stay differentiated and stable. It encodes
   * nothing real — delete it along with the generator once measured numbers land.
   */
  scaleTier: ScaleTier
}

export const STATE_SOURCE: Record<string, StateSource> = {
  AZ: { chapter: 'established', scaleTier: 'priority', partners: ['Arizona Youth Vote', 'Chispa AZ'] },
  GA: { chapter: 'established', scaleTier: 'priority', partners: ['New Georgia Project', 'Georgia Shift'] },
  MI: { chapter: 'established', scaleTier: 'priority', partners: ['MI Student Power', 'Detroit Action'] },
  NC: { chapter: 'established', scaleTier: 'priority', partners: ['NC Black Alliance', 'Down Home NC'] },
  NV: { chapter: 'established', scaleTier: 'priority', partners: ['Silver State Voices'] },
  PA: { chapter: 'established', scaleTier: 'priority', partners: ['PA Youth Vote', 'Make the Road PA'] },
  WI: { chapter: 'established', scaleTier: 'priority', partners: ['WI Youth Power', 'BLOC'] },
  TX: { chapter: 'established', scaleTier: 'priority', partners: ['MOVE Texas', 'Jolt Initiative'] },

  FL: { chapter: 'established', scaleTier: 'soft', partners: ['Florida Rising', 'Dream Defenders'] },
  OH: { chapter: 'established', scaleTier: 'soft', partners: ['Ohio Student Assoc.'] },
  VA: { chapter: 'established', scaleTier: 'soft', partners: ['New Virginia Majority'] },
  MN: { chapter: 'established', scaleTier: 'soft', partners: ['MN Youth Collective'] },
  CO: { chapter: 'established', scaleTier: 'soft', partners: ['New Era Colorado'] },
  NH: { chapter: 'building', scaleTier: 'soft', partners: ['NH Youth Movement'] },
  NM: { chapter: 'building', scaleTier: 'soft', partners: ['NM Native Vote'] },
  IA: { chapter: 'building', scaleTier: 'soft', partners: [] },
  ME: { chapter: 'building', scaleTier: 'soft', partners: ['Maine Youth Action'] },

  CA: { chapter: 'established', scaleTier: 'nice', partners: ['CA Calls', 'Power CA Action'] },
  NJ: { chapter: 'established', scaleTier: 'nice', partners: ['NJ Youth Power'] },
  NY: { chapter: 'established', scaleTier: 'nice', partners: ['NY Youth Agenda'] },
  IL: { chapter: 'established', scaleTier: 'nice', partners: ['Chicago Votes'] },
  WA: { chapter: 'established', scaleTier: 'nice', partners: ['WA Youth Alliance'] },
  MA: { chapter: 'established', scaleTier: 'nice', partners: ['MassVOTE'] },
  OR: { chapter: 'established', scaleTier: 'nice', partners: ['Next Up Action'] },
  MD: { chapter: 'established', scaleTier: 'nice', partners: [] },
  MO: { chapter: 'building', scaleTier: 'nice', partners: [] },
  TN: { chapter: 'building', scaleTier: 'nice', partners: ['The Equity Alliance'] },
  UT: { chapter: 'building', scaleTier: 'nice', partners: [] },
  CT: { chapter: 'building', scaleTier: 'nice', partners: [] },
  KS: { chapter: 'none', scaleTier: 'nice', partners: [] },
  IN: { chapter: 'none', scaleTier: 'nice', partners: [] },
  MT: { chapter: 'none', scaleTier: 'nice', partners: [] },
  AK: { chapter: 'none', scaleTier: 'nice', partners: [] },
  SC: { chapter: 'none', scaleTier: 'nice', partners: [] },
  LA: { chapter: 'none', scaleTier: 'nice', partners: [] },
  KY: { chapter: 'none', scaleTier: 'nice', partners: [] },
  NE: { chapter: 'none', scaleTier: 'nice', partners: [] },
  OK: { chapter: 'none', scaleTier: 'nice', partners: [] },
  AL: { chapter: 'none', scaleTier: 'nice', partners: [] },
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
    const source = STATE_SOURCE[abbr] ?? { chapter: 'none', partners: [], scaleTier: 'nice' }
    const types = stateTargetTypes(abbr)

    return [
      abbr,
      {
        abbr,
        name: STATE_NAME[abbr] ?? abbr,
        types,
        tier: types[0]!,
        targets: targetsIn(abbr),
        districts: targetDistrictsIn(abbr),
        chapter: source.chapter,
        partners: source.partners,
        ...deriveMetrics(abbr, source.scaleTier, source.chapter, types.includes('hard')),
      } satisfies StateRecord,
    ]
  }),
)

/** Chapter-status presentation: label and dot colour. */
export const CHAPTER_STATUS: Record<ChapterStatus, { label: string; color: string }> = {
  established: { label: 'Established chapter', color: 'var(--chapter)' },
  building: { label: 'In development', color: '#7f8ea3' },
  none: { label: 'No chapter yet', color: '#4a5566' },
}

/** `'OH-09'` -> `'09'`. Districts carry their state prefix for readability. */
export function districtNumber(id: string): string {
  return id.split('-')[1] ?? id
}
