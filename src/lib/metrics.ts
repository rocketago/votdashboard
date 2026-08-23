/**
 * The one remaining placeholder figure.
 *
 * Registrations, pledges and students engaged are real — see `src/data/reports.ts`.
 * Only the volunteer count is still derived from a hash of the state abbreviation, so
 * the same state shows the same figure across reloads. It is not marked as such in the
 * UI. Goals used to live here too; the panel now shows totals rather than progress
 * against a target that was never real. It is
 * derived from the state abbreviation via an FNV-1a-style hash so the same state
 * always shows the same figures across reloads — a stable mock, not random noise.
 *
 * When the real numbers arrive, delete this file and put the measured values
 * straight onto the records in `src/data/states.ts`; `StateRecord` already carries
 * the fields, so nothing downstream has to change.
 *
 * The chapter count used to be generated here too. It no longer is — it comes from
 * `src/data/chapters.ts`, which is synced from Airtable.
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

export type ChapterStatus = 'established' | 'none'

export interface DerivedMetrics {
  /** Trained volunteers. */
  vol: number
}

/**
 * The last generated figure in the dashboard. Registrations, pledges and students
 * engaged are measured; volunteer counts are not reported anywhere in Airtable yet.
 */
export function deriveMetrics(abbr: string): DerivedMetrics {
  return { vol: Math.round(30 + unit(`${abbr}p`) * 260) }
}
