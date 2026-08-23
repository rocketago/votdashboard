import { useMemo } from 'react'
import {
  EVENTS,
  PROGRAM_TYPE,
  PROGRAM_TYPE_ORDER,
  eventDate,
  eventMonths,
  type ProgramEvent,
  type ProgramType,
} from '../../data/events'

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
  const shown = useMemo(
    () => EVENTS.filter((e) => programFilters[e.type] && isVisible(e.state)),
    [programFilters, isVisible],
  )

  // Months come from the full event set, not the filtered one, so the calendar keeps
  // its shape as filters are toggled instead of collapsing month by month.
  const months = useMemo(() => eventMonths(EVENTS), [])

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

  const stateCount = new Set(shown.map((e) => e.state)).size

  return (
    <div className="calwrap">
      <div className="calhead">
        <h2>Program calendar</h2>
        <span className="c">
          {shown.length} scheduled events · {stateCount} states
        </span>
      </div>

      {months.length ? (
        months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            byDay={byDay}
            onOpenState={onOpenState}
          />
        ))
      ) : (
        <p className="calempty">
          {EVENTS.length
            ? 'No events match the current filters.'
            : 'Nothing in the event tracker yet. Events added in Airtable appear here after the next sync.'}
        </p>
      )}

      <div className="callegend">
        {PROGRAM_TYPE_ORDER.map((type) => (
          <div key={type}>
            <i style={{ background: PROGRAM_TYPE[type].color }} />
            {PROGRAM_TYPE[type].label} — {PROGRAM_TYPE[type].note}
          </div>
        ))}
      </div>
    </div>
  )
}

interface MonthProps {
  year: number
  month: number
  byDay: Map<string, ProgramEvent[]>
  onOpenState: (abbr: string) => void
}

function MonthGrid({ year, month, byDay, onOpenState }: MonthProps) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const dayCount = new Date(year, month + 1, 0).getDate()
  const trailing = (firstWeekday + dayCount) % 7

  return (
    <div className="month">
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
          const events = byDay.get(`${year}-${month}-${day}`) ?? []
          return (
            <div className={`cell${events.length ? ' has' : ''}`} key={day}>
              <span className="n">{day}</span>
              {events.map((e) => (
                <button
                  key={`${e.state}-${e.title}`}
                  className="evc"
                  style={{ borderLeftColor: PROGRAM_TYPE[e.type].color }}
                  title={`${PROGRAM_TYPE[e.type].label}${e.meta ? ` · ${e.meta}` : ''}`}
                  onClick={() => onOpenState(e.state)}
                >
                  <span className="st">{e.state}</span>
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
