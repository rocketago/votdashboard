import { rankTypes, type TargetType } from './tiers'
import {
  deriveMetrics,
  type ChapterStatus,
  type DerivedMetrics,
  type ScaleTier,
} from '../lib/metrics'

/**
 * The target board: every state VOT runs a coordinated program in this cycle.
 *
 * PLACEHOLDER DATA. The target mixes, chapter statuses, district lists and partner
 * orgs below were assigned during design and are not confirmed. Replace the values
 * here — the shape is the contract, nothing downstream reads anything else.
 */
export interface StateSource {
  /** Every target classification the state carries; order here does not matter. */
  types: TargetType[]
  /**
   * Legacy single-tier classification, kept only to scale the placeholder metrics
   * (see `src/lib/metrics.ts`). Drop it once real figures land.
   */
  scaleTier: ScaleTier
  chapter: ChapterStatus
  /** Target congressional districts, written the way organizers write them. */
  districts: string[]
  partners: string[]
}

export const STATE_SOURCE: Record<string, StateSource> = {
  AZ: { types: ['hard', 'dev'], scaleTier: 'priority', chapter: 'established', districts: ['AZ-01', 'AZ-04', 'AZ-06'], partners: ['Arizona Youth Vote', 'Chispa AZ'] },
  GA: { types: ['hard', 'soft'], scaleTier: 'priority', chapter: 'established', districts: ['GA-01', 'GA-02', 'GA-13'], partners: ['New Georgia Project', 'Georgia Shift'] },
  MI: { types: ['hard'], scaleTier: 'priority', chapter: 'established', districts: ['MI-07', 'MI-08', 'MI-10'], partners: ['MI Student Power', 'Detroit Action'] },
  NC: { types: ['hard', 'dev'], scaleTier: 'priority', chapter: 'established', districts: ['NC-01', 'NC-06', 'NC-14'], partners: ['NC Black Alliance', 'Down Home NC'] },
  NV: { types: ['hard', 'soft', 'dev'], scaleTier: 'priority', chapter: 'established', districts: ['NV-01', 'NV-03', 'NV-04'], partners: ['Silver State Voices'] },
  PA: { types: ['hard'], scaleTier: 'priority', chapter: 'established', districts: ['PA-07', 'PA-08', 'PA-10', 'PA-17'], partners: ['PA Youth Vote', 'Make the Road PA'] },
  WI: { types: ['hard', 'dev'], scaleTier: 'priority', chapter: 'established', districts: ['WI-01', 'WI-03'], partners: ['WI Youth Power', 'BLOC'] },
  TX: { types: ['hard', 'soft', 'dev'], scaleTier: 'priority', chapter: 'established', districts: ['TX-15', 'TX-28', 'TX-34'], partners: ['MOVE Texas', 'Jolt Initiative'] },

  FL: { types: ['soft', 'dev'], scaleTier: 'soft', chapter: 'established', districts: ['FL-13', 'FL-27'], partners: ['Florida Rising', 'Dream Defenders'] },
  OH: { types: ['soft'], scaleTier: 'soft', chapter: 'established', districts: ['OH-01', 'OH-09', 'OH-13'], partners: ['Ohio Student Assoc.'] },
  VA: { types: ['soft'], scaleTier: 'soft', chapter: 'established', districts: ['VA-02', 'VA-07'], partners: ['New Virginia Majority'] },
  MN: { types: ['soft', 'dev'], scaleTier: 'soft', chapter: 'established', districts: ['MN-02'], partners: ['MN Youth Collective'] },
  CO: { types: ['soft'], scaleTier: 'soft', chapter: 'established', districts: ['CO-08'], partners: ['New Era Colorado'] },
  NH: { types: ['soft', 'dev'], scaleTier: 'soft', chapter: 'building', districts: ['NH-01'], partners: ['NH Youth Movement'] },
  NM: { types: ['soft', 'dev'], scaleTier: 'soft', chapter: 'building', districts: [], partners: ['NM Native Vote'] },
  IA: { types: ['soft'], scaleTier: 'soft', chapter: 'building', districts: ['IA-01', 'IA-03'], partners: [] },
  ME: { types: ['soft'], scaleTier: 'soft', chapter: 'building', districts: ['ME-02'], partners: ['Maine Youth Action'] },

  CA: { types: ['soft', 'dev'], scaleTier: 'nice', chapter: 'established', districts: ['CA-13', 'CA-22', 'CA-41', 'CA-45'], partners: ['CA Calls', 'Power CA Action'] },
  NJ: { types: ['soft', 'dev'], scaleTier: 'nice', chapter: 'established', districts: ['NJ-07'], partners: ['NJ Youth Power'] },
  NY: { types: ['dev'], scaleTier: 'nice', chapter: 'established', districts: ['NY-04', 'NY-17', 'NY-19'], partners: ['NY Youth Agenda'] },
  IL: { types: ['dev'], scaleTier: 'nice', chapter: 'established', districts: ['IL-13', 'IL-17'], partners: ['Chicago Votes'] },
  WA: { types: ['dev'], scaleTier: 'nice', chapter: 'established', districts: ['WA-03', 'WA-08'], partners: ['WA Youth Alliance'] },
  MA: { types: ['dev'], scaleTier: 'nice', chapter: 'established', districts: [], partners: ['MassVOTE'] },
  OR: { types: ['dev'], scaleTier: 'nice', chapter: 'established', districts: ['OR-05', 'OR-06'], partners: ['Next Up Action'] },
  MD: { types: ['dev'], scaleTier: 'nice', chapter: 'established', districts: [], partners: [] },
  MO: { types: ['dev'], scaleTier: 'nice', chapter: 'building', districts: ['MO-02'], partners: [] },
  TN: { types: ['dev'], scaleTier: 'nice', chapter: 'building', districts: [], partners: ['The Equity Alliance'] },
  UT: { types: ['dev'], scaleTier: 'nice', chapter: 'building', districts: ['UT-04'], partners: [] },
  CT: { types: ['dev'], scaleTier: 'nice', chapter: 'building', districts: ['CT-05'], partners: [] },
  KS: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: ['KS-03'], partners: [] },
  IN: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: ['IN-01'], partners: [] },
  MT: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: ['MT-01'], partners: [] },
  AK: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: ['AK-00'], partners: [] },
  SC: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: [], partners: [] },
  LA: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: ['LA-06'], partners: [] },
  KY: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: [], partners: [] },
  NE: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: ['NE-02'], partners: [] },
  OK: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: [], partners: [] },
  AL: { types: ['dev'], scaleTier: 'nice', chapter: 'none', districts: ['AL-02'], partners: [] },
}

export interface StateRecord extends DerivedMetrics {
  abbr: string
  name: string
  /** Target types in ranked order (Soft > Hard > Development). */
  types: TargetType[]
  /** Dominant target type — the first of `types`. Drives the state's solid fill. */
  tier: TargetType
  chapter: ChapterStatus
  districts: string[]
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

/** The target board, keyed by abbreviation, with placeholder metrics resolved. */
export const STATES: Record<string, StateRecord> = Object.fromEntries(
  Object.entries(STATE_SOURCE).map(([abbr, src]) => {
    const types = rankTypes(src.types)
    return [
      abbr,
      {
        abbr,
        name: STATE_NAME[abbr] ?? abbr,
        types,
        tier: types[0]!,
        chapter: src.chapter,
        districts: src.districts,
        partners: src.partners,
        ...deriveMetrics(abbr, src.scaleTier, src.chapter, types.includes('hard')),
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

/** `'AZ-01'` -> `'01'`. Districts are stored with their state prefix for readability. */
export function districtNumber(id: string): string {
  return id.split('-')[1] ?? id
}
