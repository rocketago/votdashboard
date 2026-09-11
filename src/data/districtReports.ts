/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-airtable.mjs` from the "Districts" table in the VOT 2026 Soft Side Reports base.
 * Re-run `npm run sync` to refresh it.
 *
 * Per-district program-to-date numbers — the same shape as reports.ts (states), keyed
 * by district id instead. A district absent here reports zero, same convention as
 * reports.ts: not on the reporting board yet, not the same as having done nothing.
 */

export interface DistrictReport {
  /** Voter registration forms collected. */
  reg: number
  /** Pledges to vote collected. */
  pledge: number
  /** Students engaged. */
  students: number
}

export const DISTRICT_REPORTS: Record<string, DistrictReport> = {
  'AK-00': { reg: 0, pledge: 0, students: 0 },
  'AZ-02': { reg: 0, pledge: 0, students: 0 },
  'AZ-06': { reg: 0, pledge: 0, students: 0 },
  'CA-13': { reg: 0, pledge: 0, students: 0 },
  'CA-22': { reg: 0, pledge: 0, students: 0 },
  'CA-45': { reg: 0, pledge: 0, students: 0 },
  'CA-48': { reg: 0, pledge: 0, students: 0 },
  'CO-03': { reg: 0, pledge: 0, students: 0 },
  'CO-08': { reg: 0, pledge: 0, students: 0 },
  'FL-22': { reg: 0, pledge: 0, students: 0 },
  'IA-01': { reg: 0, pledge: 0, students: 0 },
  'IA-02': { reg: 0, pledge: 0, students: 0 },
  'IA-03': { reg: 0, pledge: 0, students: 0 },
  'MI-04': { reg: 0, pledge: 0, students: 0 },
  'MI-07': { reg: 0, pledge: 0, students: 0 },
  'MI-10': { reg: 0, pledge: 0, students: 0 },
  'MT-01': { reg: 0, pledge: 0, students: 0 },
  'NC-11': { reg: 0, pledge: 0, students: 0 },
  'NE-02': { reg: 0, pledge: 0, students: 0 },
  'NH-01': { reg: 0, pledge: 0, students: 0 },
  'NJ-07': { reg: 0, pledge: 0, students: 0 },
  'NM-02': { reg: 0, pledge: 0, students: 0 },
  'NY-17': { reg: 0, pledge: 0, students: 0 },
  'OH-01': { reg: 0, pledge: 0, students: 0 },
  'OH-09': { reg: 0, pledge: 0, students: 0 },
  'OH-13': { reg: 0, pledge: 0, students: 0 },
  'PA-01': { reg: 0, pledge: 0, students: 0 },
  'PA-07': { reg: 0, pledge: 0, students: 0 },
  'PA-08': { reg: 0, pledge: 0, students: 0 },
  'PA-10': { reg: 0, pledge: 0, students: 0 },
  'TX-15': { reg: 0, pledge: 0, students: 0 },
  'VA-01': { reg: 0, pledge: 0, students: 0 },
  'VA-02': { reg: 0, pledge: 0, students: 0 },
  'VA-05': { reg: 0, pledge: 0, students: 0 },
  'WA-03': { reg: 0, pledge: 0, students: 0 },
  'WI-01': { reg: 0, pledge: 0, students: 0 },
  'WI-03': { reg: 0, pledge: 0, students: 0 },
}

const NOTHING: DistrictReport = { reg: 0, pledge: 0, students: 0 }

/** Reported totals for a district, zeroed where the district does not report yet. */
export const districtReportFor = (id: string): DistrictReport => DISTRICT_REPORTS[id] ?? NOTHING
