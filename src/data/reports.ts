/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-airtable.mjs` from the "States" table in the VOT 2026 Soft Side Reports base.
 * Re-run `npm run sync` to refresh it.
 *
 * Measured programme numbers, replacing what used to be generated. Airtable rolls
 * these up from the chapter and fellow report tables, so they move as reports land
 * rather than when this file is edited.
 *
 * A state absent here reports zero — it is not on the reporting board yet, which is not
 * the same as having done nothing. Goals are still placeholders; Airtable holds no
 * targets to compare these against.
 */

export interface StateReport {
  /** Voter registration forms collected. */
  reg: number
  /** Pledges to vote collected. */
  pledge: number
  /** Students engaged. */
  students: number
}

export const REPORTS: Record<string, StateReport> = {
  AK: { reg: 0, pledge: 0, students: 0 },
  AZ: { reg: 0, pledge: 0, students: 0 },
  CA: { reg: 0, pledge: 0, students: 0 },
  CO: { reg: 0, pledge: 0, students: 0 },
  FL: { reg: 0, pledge: 0, students: 0 },
  GA: { reg: 0, pledge: 0, students: 0 },
  IA: { reg: 0, pledge: 0, students: 0 },
  ME: { reg: 0, pledge: 0, students: 0 },
  MI: { reg: 0, pledge: 0, students: 0 },
  MT: { reg: 0, pledge: 0, students: 0 },
  NC: { reg: 0, pledge: 0, students: 0 },
  NE: { reg: 0, pledge: 0, students: 0 },
  NH: { reg: 0, pledge: 0, students: 0 },
  NJ: { reg: 0, pledge: 0, students: 0 },
  NM: { reg: 0, pledge: 0, students: 0 },
  NY: { reg: 0, pledge: 0, students: 0 },
  OH: { reg: 0, pledge: 0, students: 0 },
  PA: { reg: 0, pledge: 0, students: 0 },
  TX: { reg: 0, pledge: 0, students: 0 },
  VA: { reg: 0, pledge: 0, students: 0 },
  WA: { reg: 0, pledge: 0, students: 0 },
  WI: { reg: 0, pledge: 0, students: 0 },
}

const NOTHING: StateReport = { reg: 0, pledge: 0, students: 0 }

/** Reported totals for a state, zeroed where the state does not report yet. */
export const reportFor = (abbr: string): StateReport => REPORTS[abbr] ?? NOTHING
