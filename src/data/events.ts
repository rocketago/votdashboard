/**
 * The national programme calendar.
 *
 * PLACEHOLDER DATA, with two caveats carried over from the design session that the
 * organizing team still needs to settle:
 *
 *  1. Every event's `type` was assigned during design, not by the programme leads.
 *  2. The twelve events marked `invented: true` were added during design because the
 *     original set was almost entirely in-person, which left both Distributed filters
 *     looking broken. Delete them once the real distributed programmes are known.
 */

/** Programme type. `h`/`s` = hard/soft ask; `ip`/`d` = in-person/distributed. */
export type ProgramType = 'hip' | 'hd' | 'sip' | 'sd'

export interface ProgramTypeSpec {
  label: string
  color: string
  note: string
}

export const PROGRAM_TYPE: Record<ProgramType, ProgramTypeSpec> = {
  hip: { label: 'Hard In-Person', color: '#ff7a3d', note: 'direct voter contact, single site' },
  hd: { label: 'Hard Distributed', color: '#f4d03f', note: 'direct voter contact, many sites or remote' },
  sip: { label: 'Soft In-Person', color: '#3fd2c7', note: 'community & education, single site' },
  sd: { label: 'Soft Distributed', color: '#8b7bd8', note: 'community & education, many sites or remote' },
}

/** Filter order in the sidebar and the legend. */
export const PROGRAM_TYPE_ORDER: readonly ProgramType[] = ['hip', 'hd', 'sip', 'sd'] as const

export interface ProgramEvent {
  /** ISO `YYYY-MM-DD`. The calendar derives its month range from these. */
  date: string
  state: string
  title: string
  /** Free-text location / turnout detail. May be empty. */
  meta: string
  type: ProgramType
  /** Added during design to populate the Distributed filters — not a real programme. */
  invented?: true
}

export const EVENTS: ProgramEvent[] = [
  // Arizona
  { date: '2026-09-12', state: 'AZ', title: 'Tempe voter reg drive', meta: 'Arizona State · Hayden Lawn · 40 shifts', type: 'hip' },
  { date: '2026-09-26', state: 'AZ', title: 'Chapter leadership retreat', meta: 'Phoenix · 55 RSVPs', type: 'sip' },
  { date: '2026-10-05', state: 'AZ', title: 'Deadline push canvass', meta: 'Maricopa County · with Chispa AZ', type: 'hd' },
  { date: '2026-10-12', state: 'AZ', title: 'Statewide pledge text bank', meta: '25 volunteers · relational', type: 'hd', invented: true },

  // Georgia
  { date: '2026-09-09', state: 'GA', title: 'Athens campus takeover', meta: 'U of Georgia · Tate Plaza', type: 'sip' },
  { date: '2026-09-15', state: 'GA', title: 'Peer-to-peer pledge push', meta: 'Chapter-led · statewide', type: 'sd', invented: true },
  { date: '2026-09-20', state: 'GA', title: 'Senate debate watch party', meta: 'Atlanta · 120 RSVPs', type: 'sip' },
  { date: '2026-10-06', state: 'GA', title: 'Registration deadline blitz', meta: 'Statewide · 9 sites', type: 'hd' },

  // Michigan
  { date: '2026-09-15', state: 'MI', title: 'Ann Arbor kickoff', meta: 'U of Michigan · Diag · 60 shifts', type: 'sip' },
  { date: '2026-09-28', state: 'MI', title: 'Detroit door knock', meta: 'with Detroit Action', type: 'hip' },
  { date: '2026-10-05', state: 'MI', title: 'Issue education week', meta: 'All chapters · distributed', type: 'sd', invented: true },
  { date: '2026-10-12', state: 'MI', title: 'Early vote march', meta: 'Lansing · 200 RSVPs', type: 'sip' },

  // North Carolina
  { date: '2026-09-11', state: 'NC', title: 'Chapel Hill reg drive', meta: 'UNC · Pit · 35 shifts', type: 'hip' },
  { date: '2026-09-24', state: 'NC', title: 'HBCU organizing summit', meta: 'Durham · 85 RSVPs', type: 'sip' },
  { date: '2026-10-09', state: 'NC', title: 'Deadline text bank', meta: 'Statewide', type: 'hd', invented: true },

  // Nevada
  { date: '2026-09-17', state: 'NV', title: 'UNLV welcome week table', meta: 'Las Vegas · 5 days', type: 'hip' },
  { date: '2026-10-03', state: 'NV', title: 'Reno youth town hall', meta: 'U of Nevada Reno', type: 'sip' },
  { date: '2026-10-10', state: 'NV', title: 'Chapter social week', meta: 'Distributed', type: 'sd', invented: true },

  // Pennsylvania
  { date: '2026-09-10', state: 'PA', title: 'Philly reg week', meta: 'Temple · 6 sites', type: 'hd' },
  { date: '2026-09-23', state: 'PA', title: 'State College canvass', meta: 'Penn State · 45 shifts', type: 'hip' },
  { date: '2026-10-01', state: 'PA', title: 'Relational reg asks', meta: 'Chapter-led · statewide', type: 'hd', invented: true },
  { date: '2026-10-20', state: 'PA', title: 'Early vote party', meta: 'Pittsburgh', type: 'sip' },

  // Wisconsin
  { date: '2026-09-16', state: 'WI', title: 'Madison library mall drive', meta: 'UW–Madison', type: 'hip' },
  { date: '2026-10-08', state: 'WI', title: 'Milwaukee GOTV training', meta: 'with BLOC · 70 RSVPs', type: 'sip' },
  { date: '2026-10-15', state: 'WI', title: 'Early vote explainer push', meta: 'Distributed', type: 'sd', invented: true },

  // Texas
  { date: '2026-09-08', state: 'TX', title: 'Austin reg blitz', meta: 'UT Austin · West Mall', type: 'hip' },
  { date: '2026-09-19', state: 'TX', title: 'RGV youth summit', meta: 'McAllen · with MOVE Texas', type: 'sip' },
  { date: '2026-10-07', state: 'TX', title: 'San Antonio deadline push', meta: 'UTSA', type: 'hd' },
  { date: '2026-10-15', state: 'TX', title: 'Ballot explainer series', meta: 'Distributed · 6 campuses', type: 'sd', invented: true },

  // Florida
  { date: '2026-09-18', state: 'FL', title: 'Gainesville reg drive', meta: 'U of Florida · Turlington', type: 'hip' },
  { date: '2026-10-01', state: 'FL', title: 'Miami youth forum', meta: 'FIU · 90 RSVPs', type: 'sip' },
  { date: '2026-10-08', state: 'FL', title: 'Vote pledge text bank', meta: 'Statewide', type: 'hd', invented: true },

  // Ohio
  { date: '2026-09-22', state: 'OH', title: 'Columbus oval tabling', meta: 'Ohio State', type: 'hip' },
  { date: '2026-09-30', state: 'OH', title: 'Relational pledge week', meta: 'Chapter-led', type: 'sd', invented: true },
  { date: '2026-10-06', state: 'OH', title: 'Cleveland deadline canvass', meta: '', type: 'hd' },

  // Minnesota
  { date: '2026-09-25', state: 'MN', title: 'Twin Cities reg drive', meta: 'U of Minnesota · Coffman', type: 'hip' },
  { date: '2026-10-07', state: 'MN', title: 'Campus ballot guide drop', meta: 'Distributed', type: 'sd', invented: true },

  // Single-event states
  { date: '2026-09-13', state: 'VA', title: 'Charlottesville tabling', meta: 'UVA', type: 'hip' },
  { date: '2026-09-29', state: 'NH', title: 'Durham reg push', meta: 'UNH', type: 'hip' },
  { date: '2026-09-30', state: 'CO', title: 'Boulder ballot party', meta: 'CU Boulder · 50 RSVPs', type: 'sip' },
  { date: '2026-09-21', state: 'NY', title: 'CUNY reg week', meta: 'Hunter College', type: 'hd' },
  { date: '2026-10-02', state: 'IL', title: 'Chicago youth assembly', meta: 'with Chicago Votes', type: 'sip' },

  // California
  { date: '2026-09-14', state: 'CA', title: 'Westwood reg drive', meta: 'UCLA · Bruin Plaza', type: 'hip' },
  { date: '2026-10-05', state: 'CA', title: 'Statewide pledge drive', meta: 'Distributed · 8 campuses', type: 'sd', invented: true },
  { date: '2026-10-10', state: 'CA', title: 'Bay Area chapter summit', meta: 'UC Berkeley', type: 'sip' },
]

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Parses an event's ISO date into local calendar parts, with no timezone shift. */
export function eventDate(e: ProgramEvent): { year: number; month: number; day: number } {
  const [year, month, day] = e.date.split('-').map(Number) as [number, number, number]
  return { year, month: month - 1, day }
}

/** `'2026-09-12'` -> `'SEP 12'`, as shown in the state detail panel. */
export function shortDate(e: ProgramEvent): string {
  const { month, day } = eventDate(e)
  return `${MONTH_ABBR[month]} ${String(day).padStart(2, '0')}`
}

const BY_STATE = EVENTS.reduce<Record<string, ProgramEvent[]>>((acc, e) => {
  ;(acc[e.state] ??= []).push(e)
  return acc
}, {})

for (const list of Object.values(BY_STATE)) {
  list.sort((a, b) => a.date.localeCompare(b.date))
}

export const eventsIn = (abbr: string): ProgramEvent[] => BY_STATE[abbr] ?? []

/**
 * Every distinct `{year, month}` present in the data, ascending. The calendar renders
 * one grid per entry, so adding a November event grows the calendar with no code change.
 */
export function eventMonths(events: ProgramEvent[]): { year: number; month: number }[] {
  const seen = new Set<string>()
  const out: { year: number; month: number }[] = []
  for (const e of events) {
    const { year, month } = eventDate(e)
    const key = `${year}-${month}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ year, month })
  }
  return out.sort((a, b) => a.year - b.year || a.month - b.month)
}
