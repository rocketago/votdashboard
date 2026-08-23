/** The target classifications a state can carry. A state may hold several at once. */
export type TargetType = 'soft' | 'hard' | 'dev' | 'sdev'

export interface TierSpec {
  label: string
  color: string
  /**
   * Readable foreground on `color`, for the solid chips in the detail panel.
   * Secondary Development is dark enough that near-black text on it fails badly —
   * 1.8:1 — so it is the one that takes light text.
   */
  text: string
}

/** Text colours the tiers choose between. */
const INK = '#0d1016'
const PAPER = '#eef2f7'

export const TIER: Record<TargetType, TierSpec> = {
  hard: { label: 'Hard Target', color: '#e2604f', text: INK },
  soft: { label: 'Soft Target', color: '#2c9c93', text: INK },
  dev: { label: 'Development Target', color: '#e5a343', text: INK },
  sdev: { label: 'Secondary Development', color: '#2e3a6e', text: PAPER },
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
  /** Chapter markers on the national board. Deliberately not a tier colour. */
  chapter: '#b32c86',
  /** Campus programme dots at state zoom. */
  campus: '#f0f3f8',
  /** Fill for a congressional district that is not a target. */
  districtOther: '#252d3b',
  /** Fill for the selected state's landmass behind its districts. */
  selectedLand: '#151b25',
} as const
