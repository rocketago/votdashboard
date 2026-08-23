/**
 * The national programme calendar.
 *
 * The events themselves are synced from Airtable into `events.data.ts`; this file holds
 * the programme types and the date helpers the calendar is built on. Colours here have
 * to stay in step with `tokens.css`, as everywhere else in the app.
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
  /** ISO `YYYY-MM-DD`, Eastern. The calendar derives its month range from these. */
  date: string
  /**
   * Start time, Eastern, e.g. `'6:00 PM'`.
   *
   * Already converted when the data is synced, so it reads the same wherever the
   * dashboard is opened. Nothing here re-interprets it against the reader's clock.
   */
  time: string
  state: string
  title: string
  /** Free-text location / turnout detail. May be empty. */
  meta: string
  type: ProgramType
}

export { EVENTS } from './events.data'
import { EVENTS } from './events.data'

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
 * Election day, and the months the calendar always shows.
 *
 * The 2026 general is the first Tuesday after the first Monday in November: the 3rd.
 * September through November are drawn whether or not anything is scheduled in them, so
 * the calendar is a plan to fill in rather than a blank that appears broken.
 */
export const ELECTION_DAY = { year: 2026, month: 10, day: 3 }

const CYCLE_MONTHS: { year: number; month: number }[] = [
  { year: 2026, month: 8 },
  { year: 2026, month: 9 },
  { year: 2026, month: 10 },
]

/** True for the one cell that is election day. */
export const isElectionDay = (year: number, month: number, day: number): boolean =>
  year === ELECTION_DAY.year && month === ELECTION_DAY.month && day === ELECTION_DAY.day

/**
 * The months the calendar renders: the cycle months, plus any month an event falls in.
 * An event outside September–November grows the calendar with no code change.
 */
export function eventMonths(events: ProgramEvent[]): { year: number; month: number }[] {
  const seen = new Set<string>()
  const out: { year: number; month: number }[] = []

  for (const m of CYCLE_MONTHS) {
    seen.add(`${m.year}-${m.month}`)
    out.push(m)
  }

  for (const e of events) {
    const { year, month } = eventDate(e)
    const key = `${year}-${month}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ year, month })
  }
  return out.sort((a, b) => a.year - b.year || a.month - b.month)
}
