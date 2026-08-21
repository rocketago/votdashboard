/**
 * Deterministic placeholder metrics.
 *
 * Every registration / pledge / volunteer number in this dashboard is fake. It is
 * derived from the state abbreviation via an FNV-1a-style hash so the same state
 * always shows the same figures across reloads — a stable mock, not random noise.
 *
 * When the real numbers arrive, delete this file and put the measured values
 * straight onto the records in `src/data/states.ts`; `StateRecord` already carries
 * the fields, so nothing downstream has to change.
 */

/**
 * FNV-1a-flavoured string hash, kept byte-for-byte identical to the design
 * prototype so the generated figures match the approved mockup exactly.
 *
 * Note: the multiply overflows 2^53 before `>>> 0` truncates it, so the low bits
 * are not a true FNV-1a. That is intentional — it is deterministic in JS, and
 * reproducing the prototype's output matters more here than hash quality.
 */
export function hash(str: string): number {
  let x = 2166136261
  for (const c of str) x = ((x ^ c.charCodeAt(0)) * 16777619) >>> 0
  return x >>> 0
}

/** Hash normalised to the 0..1 range. */
const unit = (str: string): number => hash(str) / 4294967295

export type ChapterStatus = 'established' | 'building' | 'none'

/**
 * Legacy single-tier classification. Superseded by the multi-target `types` list
 * for anything user-facing; retained only as the magnitude input below, so that
 * priority states generate larger placeholder numbers than development ones.
 */
export type ScaleTier = 'priority' | 'soft' | 'nice'

const SCALE: Record<ScaleTier, number> = { priority: 1, soft: 0.55, nice: 0.3 }

const CHAPTER_BASE: Record<ChapterStatus, number> = {
  established: 9000,
  building: 2600,
  none: 700,
}

export interface DerivedMetrics {
  /** Voters registered to date. */
  reg: number
  /** Registration goal for the cycle. */
  goal: number
  /** Pledges to vote collected to date. */
  pledge: number
  /** Pledge goal for the cycle. */
  pgoal: number
  /** Trained volunteers. */
  vol: number
  /** Active chartered chapters. */
  chapters: number
}

export function deriveMetrics(
  abbr: string,
  scaleTier: ScaleTier,
  chapter: ChapterStatus,
  hasHardTarget: boolean,
): DerivedMetrics {
  const r = unit(abbr)
  const r2 = unit(abbr + 'p')
  const r3 = unit(abbr + 'e')

  const base = CHAPTER_BASE[chapter]
  const reg = Math.round(((base + r * base * 1.9) * SCALE[scaleTier]) / 100) * 100
  const goal = Math.round((reg * (1.25 + r2 * 0.7)) / 500) * 500
  const pledge = Math.round((reg * (0.42 + r3 * 0.5)) / 50) * 50
  const pgoal = Math.round((pledge * (1.2 + r * 0.6)) / 250) * 250

  return {
    reg,
    goal,
    pledge,
    pgoal,
    vol: Math.round(30 + r2 * 260),
    chapters: chapter === 'none' ? 0 : 1 + Math.round(r * (hasHardTarget ? 7 : 3)),
  }
}
