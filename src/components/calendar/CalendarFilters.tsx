import { EVENTS, PROGRAM_TYPE, PROGRAM_TYPE_ORDER, type ProgramType } from '../../data/events'

interface Props {
  programFilters: Record<ProgramType, boolean>
  setProgramFilter: (type: ProgramType, on: boolean) => void
  isVisible: (abbr: string) => boolean
}

export function CalendarFilters({ programFilters, setProgramFilter, isVisible }: Props) {
  // The tally counts everything on the visible board, ignoring the type checkboxes,
  // so it reads as "what exists" rather than "what is currently shown".
  const onBoard = EVENTS.filter((e) => isVisible(e.state))

  return (
    <aside className="filters">
      <div className="fgroup">
        <h3>Program type</h3>
        {PROGRAM_TYPE_ORDER.map((type) => (
          <label className="chk" key={type}>
            <input
              type="checkbox"
              checked={programFilters[type]}
              onChange={(e) => setProgramFilter(type, e.target.checked)}
            />
            <span className="swatch" style={{ background: PROGRAM_TYPE[type].color }} />
            {PROGRAM_TYPE[type].label}
          </label>
        ))}
      </div>

      <div className="fdiv" />

      <div className="fgroup">
        <h3>Scheduled</h3>
        <div>
          {PROGRAM_TYPE_ORDER.map((type) => (
            <div className="ftally" key={type}>
              <span>{PROGRAM_TYPE[type].label}</span>
              <b>{onBoard.filter((e) => e.type === type).length}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="fdiv" />

      <div className="fnote">
        Hard programs make a direct voter contact ask. Distributed programs run across
        multiple sites or remotely. Click any event to open its state.
      </div>
    </aside>
  )
}
