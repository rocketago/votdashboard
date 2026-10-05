import { useCallback, useMemo } from 'react'
import {
  EVENTS,
  PROGRAM_TYPE,
  PROGRAM_TYPE_ORDER,
  TBD_STATE,
  eventDate,
  eventMonths,
  isElectionDay,
  type ProgramEvent,
  type ProgramType,
} from '../../data/events'

function todayET(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(new Date())
  const get = (type: string) => Number(parts.find(p => p.type === type)!.value)
  return { year: get('year'), month: get('month') - 1, day: get('day') }
}

/** The Airtable form behind the Event Tracker the calendar is synced from. */
const ADD_EVENT_FORM = 'https://airtable.com/appwnA2eTd4GfxZWE/pagcLZHL8gA5GPxON/form'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAME = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  programFilters: Record<ProgramType, boolean>
  isVisible: (abbr: string) => boolean
  onOpenState: (abbr: string) => void
}

export function CalendarView({ programFilters, isVisible, onOpenState }: Props) {
  const today = useMemo(() => todayET(), [])

  const shown = useMemo(
    // TBD events (no Targeted Race in Airtable) bypass the state filter — they are
    // relevant to every viewer and must always appear.
    () => EVENTS.filter((e) => programFilters[e.type] && (e.state === TBD_STATE || isVisible(e.state))),
    [programFilters, isVisible],
  )

  // Months come from the full event set, not the filtered one, so the calendar keeps
  // its shape as filters are toggled instead of collapsing month by month.
  const months = useMemo(() => eventMonths(EVENTS), [])

  // Scroll the current month (or first future month, if current isn't in the list) into
  // view on mount. scrollIntoView fires immediately — no layout jank.
  const scrollTargetRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [])

  const byDay = useMemo(() => {
    const map = new Map<string, ProgramEvent[]>()
    for (const e of shown) {
      const { year, month, day } = eventDate(e)
      const key = `${year}-${month}-${day}`
      const list = map.get(key)
      if (list) list.push(e)
      else map.set(key, [e])
    }
    return map
  }, [shown])

  // Exclude TBD from the state count — it is a sentinel, not a real state.
  const stateCount = new Set(shown.filter((e) => e.state !== TBD_STATE).map((e) => e.state)).size

  return (
    <div className="calwrap">
      <div className="calhead">
        <h2>Program calendar</h2>
        <span className="c">
          {shown.length} scheduled events · {stateCount} states · all times Eastern
        </span>

        {/* The tracker itself. New events reach the calendar on the next `npm run sync`,
            not the moment the form is submitted. */}
        <a className="addev" href={ADD_EVENT_FORM} target="_blank" rel="noopener noreferrer">
          Add new event
        </a>
      </div>

      {shown.length === 0 && (
        <p className="calempty">
          {EVENTS.length
            ? 'No events match the current filters.'
            : 'Nothing in the event tracker yet. Events added in Airtable appear here after the next sync.'}
        </p>
      )}

      {(() => {
        // Find the scroll target: current month if present, otherwise first future month.
        const scrollTarget = months.find(
          m => m.year === today.year && m.month === today.month,
        ) ?? months.find(
          m => m.year > today.year || (m.year === today.year && m.month > today.month),
        )
        return months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            today={today}
            byDay={byDay}
            onOpenState={onOpenState}
            scrollRef={
              scrollTarget && year === scrollTarget.year && month === scrollTarget.month
                ? scrollTargetRef
                : undefined
            }
          />
        ))
      })()}

      <div className="callegend">
        {PROGRAM_TYPE_ORDER.map((type) => (
          <div key={type}>
            <i style={{ background: PROGRAM_TYPE[type].color }} />
            {PROGRAM_TYPE[type].label}
          </div>
        ))}
      </div>
    </div>
  )
}

interface MonthProps {
  year: number
  month: number
  today: { year: number; month: number; day: number }
  byDay: Map<string, ProgramEvent[]>
  onOpenState: (abbr: string) => void
  scrollRef?: (node: HTMLDivElement | null) => void
}

function MonthGrid({ year, month, today, byDay, onOpenState, scrollRef }: MonthProps) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const dayCount = new Date(year, month + 1, 0).getDate()
  const trailing = (firstWeekday + dayCount) % 7

  const isPastMonth = year < today.year || (year === today.year && month < today.month)
  const isCurrentMonth = year === today.year && month === today.month

  return (
    <div className={`month${isPastMonth ? ' past' : ''}`} ref={scrollRef}>
      <h3>
        {MONTH_NAME[month]} {year}
      </h3>

      <div className="dow">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div className="cell out" key={`lead-${i}`} />
        ))}

        {Array.from({ length: dayCount }, (_, i) => {
          const day = i + 1
          const isPastDay = isPastMonth || (isCurrentMonth && day < today.day)
          const events = byDay.get(`${year}-${month}-${day}`) ?? []
          const election = isElectionDay(year, month, day)
          return (
            <div
              className={`cell${events.length ? ' has' : ''}${
                events.length > 1 ? ' multi' : ''
              }${election ? ' election' : ''}${isPastDay ? ' past' : ''}`}
              key={day}
            >
              <span className="n">{day}</span>
              {election && <span className="eday">Election Day</span>}
              {events.map((e) => (
                <button
                  key={`${e.state}-${e.title}`}
                  className="evc"
                  style={{ borderLeftColor: PROGRAM_TYPE[e.type].color }}
                  // The title is clamped to two lines, so the full text lives here.
                  title={`${e.title} · ${PROGRAM_TYPE[e.type].label}${e.state === TBD_STATE ? ' · Target: TBD' : ''}${e.meta ? ` · ${e.meta}` : ''}`}
                  // TBD events have no state to navigate to — clicking them is a no-op.
                  onClick={e.state !== TBD_STATE ? () => onOpenState(e.state) : undefined}
                >
                  <span className="evwhen">
                    <span className="st">{e.state === TBD_STATE ? 'Target: TBD' : e.state}</span>
                    <span className="tm">{e.time}</span>
                  </span>
                  <span className="tt">{e.title}</span>
                </button>
              ))}
            </div>
          )
        })}

        {trailing > 0 &&
          Array.from({ length: 7 - trailing }, (_, i) => (
            <div className="cell out" key={`tail-${i}`} />
          ))}
      </div>
    </div>
  )
}
