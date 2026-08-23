/** The target classifications a state can carry. A state may hold several at once. */
export type TargetType = 'soft' | 'hard' | 'dev' | 'sdev'

export interface TierSpec {
  label: string
  color: string
}

export const TIER: Record<TargetType, TierSpec> = {
  hard: { label: 'Hard Target', color: '#ff7a3d' },
  soft: { label: 'Soft Target', color: '#3fd2c7' },
  dev: { label: 'Development Target', color: '#8b7bd8' },
  // Green, chosen against the other three rather than in isolation. It has to survive
  // three tests: solid beside a Development state (Arizona borders Nevada), a ribbon
  // over Hard orange, which is how eight of the ten carry it, and a 6px dot on a chip.
  // A magenta read as Development at every size; green is the furthest hue from it that
  // still separates from the Soft teal.
  sdev: { label: 'Secondary Development', color: '#63c76a' },
}

/**
 * Ranking, strongest first: Soft > Hard > Development > Secondary Development.
 *
 * This single array drives the filter list order, which type a multi-target state
 * takes as its dominant fill, and the chip order in the detail panel. Reorder here
 * and all three follow.
 */
export const TARGET_ORDER: readonly TargetType[] = ['soft', 'hard', 'dev', 'sdev'] as const

/** Sorts a state's target types into ranked order. */
export function rankTypes(types: readonly TargetType[]): TargetType[] {
  return [...types].sort(
    (a, b) => TARGET_ORDER.indexOf(a) - TARGET_ORDER.indexOf(b),
  )
}

/** Shared palette constants used by the map layers. */
export const COLORS = {
  ink: '#0d1016',
  land: '#1a212c',
  chapter: '#f4d03f',
  /** Fill for a congressional district that is not a target. */
  districtOther: '#252d3b',
  /** Fill for the selected state's landmass behind its districts. */
  selectedLand: '#151b25',
} as const
