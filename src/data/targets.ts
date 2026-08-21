import { rankTypes, type TargetType } from './tiers'

/**
 * The 2026 target board.
 *
 * These three lists are the source of truth. Everything else about targeting — which
 * states appear on the map, what colour they take, which districts highlight when you
 * zoom in — is derived from them, so updating the board means editing only this file.
 *
 * Entries are written the way the organizing team writes them:
 *   `OH-09`   House district
 *   `NC-Sen`  Senate race
 *   `AK-00`   at-large House seat
 *   `NV`      statewide, with no specific race attached
 *
 * Note that the Soft list is currently a strict subset of the Hard list: all 20 Soft
 * targets also appear under Hard. Soft and Hard are therefore treated as overlapping
 * designations a single race can hold at once, not as mutually exclusive tiers.
 */

export const SOFT_TARGETS = [
  'OH-09', 'NC-Sen', 'IA-01', 'ME-Sen', 'OH-01', 'IA-03', 'CO-08', 'NJ-07',
  'NY-17', 'NM-02', 'NE-02', 'VA-02', 'OH-13', 'IA-02', 'CA-48', 'VA-01',
  'TX-15', 'CO-03', 'MT-01', 'VA-05',
]

export const HARD_TARGETS = [
  'OH-Sen', 'OH-09', 'NC-Sen', 'IA-01', 'MI-07', 'PA-07', 'PA-08', 'WI-03',
  'ME-Sen', 'MI-Sen', 'PA-10', 'OH-01', 'IA-03', 'GA-Sen', 'TX-Sen', 'CO-08',
  'NJ-07', 'NY-17', 'MI-04', 'MI-10', 'NC-11', 'NH-Sen', 'NE-02', 'CA-45',
  'NM-02', 'VA-02', 'OH-13', 'IA-02', 'CA-13', 'FL-22', 'VA-01', 'CA-48',
  'NH-01', 'AZ-02', 'TX-15', 'WI-01', 'AZ-06', 'CO-03', 'MT-01', 'WA-03',
  'VA-05', 'PA-01', 'AK-00', 'IA-Sen', 'AK-Sen',
]

export const DEVELOPMENT_TARGETS = ['SC', 'VA', 'NM', 'NV']

/** What kind of contest a target is. */
export type TargetScope = 'senate' | 'house' | 'state'

export interface Target {
  /** As written in the lists above, e.g. `'OH-09'`, `'NC-Sen'`, `'NV'`. */
  id: string
  state: string
  scope: TargetScope
  /** Two-digit House district number, matching the map's geometry. Null otherwise. */
  district: string | null
  /** Every designation this target carries, in ranked order (Soft > Hard > Development). */
  types: TargetType[]
}

function parse(id: string): { state: string; scope: TargetScope; district: string | null } {
  const [state, office] = id.split('-')

  if (!office) return { state: state!, scope: 'state', district: null }
  if (office.toLowerCase() === 'sen') return { state: state!, scope: 'senate', district: null }

  return { state: state!, scope: 'house', district: office.padStart(2, '0') }
}

/** Senate first, then statewide, then House districts in numeric order. */
const SCOPE_RANK: Record<TargetScope, number> = { senate: 0, state: 1, house: 2 }

function buildTargets(): Target[] {
  const types = new Map<string, Set<TargetType>>()

  const collect = (ids: string[], type: TargetType) => {
    for (const id of ids) {
      const set = types.get(id) ?? new Set<TargetType>()
      set.add(type)
      types.set(id, set)
    }
  }

  collect(SOFT_TARGETS, 'soft')
  collect(HARD_TARGETS, 'hard')
  collect(DEVELOPMENT_TARGETS, 'dev')

  return [...types.entries()]
    .map(([id, set]) => ({ id, ...parse(id), types: rankTypes([...set]) }))
    .sort(
      (a, b) =>
        a.state.localeCompare(b.state) ||
        SCOPE_RANK[a.scope] - SCOPE_RANK[b.scope] ||
        (a.district ?? '').localeCompare(b.district ?? ''),
    )
}

export const TARGETS: Target[] = buildTargets()

const BY_STATE = TARGETS.reduce<Record<string, Target[]>>((acc, t) => {
  ;(acc[t.state] ??= []).push(t)
  return acc
}, {})

/** Every target in a state — Senate, statewide and House — in display order. */
export const targetsIn = (abbr: string): Target[] => BY_STATE[abbr] ?? []

/** How a target reads in the UI. Statewide entries get an explicit qualifier. */
export function targetLabel(target: Target): string {
  return target.scope === 'state' ? `${target.state} statewide` : target.id
}

/** States carrying at least one target. These, and only these, are on the board. */
export const TARGET_STATES: string[] = Object.keys(BY_STATE).sort()

/** The union of every designation a state's targets carry, in ranked order. */
export function stateTargetTypes(abbr: string): TargetType[] {
  const set = new Set<TargetType>()
  for (const target of targetsIn(abbr)) {
    for (const type of target.types) set.add(type)
  }
  return rankTypes([...set])
}

/**
 * A state's target House districts as full ids (`'OH-09'`), which is how the detail
 * panel labels them and how `districtNumber` reads them back for the map.
 */
export function targetDistrictsIn(abbr: string): string[] {
  return targetsIn(abbr)
    .filter((t) => t.scope === 'house')
    .map((t) => t.id)
}
