import { rankTypes, type TargetType } from './tiers'

/**
 * The 2026 target board.
 *
 * The three lists come from the Target Type columns on the States and Districts tables
 * in Airtable, synced into `targets.data.ts` by `npm run sync`. Everything else about
 * targeting — which states appear on the map, what colour they take, which districts
 * highlight when you zoom in — is derived from them.
 *
 * Entries read:
 *   `OH-09`   House district
 *   `AK-00`   at-large House seat
 *   `NV`      statewide
 *
 * Soft and Hard are overlapping designations one race can hold at once, not mutually
 * exclusive tiers, and a race can hold all three. Senate races have no representation
 * of their own: Airtable records them as a designation on the state, so they read as
 * statewide.
 */

export {
  SOFT_TARGETS,
  HARD_TARGETS,
  DEVELOPMENT_TARGETS,
} from './targets.data'
import { SOFT_TARGETS, HARD_TARGETS, DEVELOPMENT_TARGETS } from './targets.data'

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
