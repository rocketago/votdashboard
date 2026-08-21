export type View = 'map' | 'cal' | 'facts'
export type MapLevel = 'states' | 'districts' | 'campuses'

const VIEWS: { key: View; label: string }[] = [
  { key: 'map', label: 'Map' },
  { key: 'cal', label: 'Calendar' },
  { key: 'facts', label: 'Quick Facts' },
]

const LEVELS: { key: MapLevel; label: string }[] = [
  { key: 'states', label: 'States' },
  { key: 'districts', label: 'Districts' },
  { key: 'campuses', label: 'Campuses' },
]

interface Props {
  view: View
  onView: (view: View) => void
  level: MapLevel
  onLevel: (level: MapLevel) => void
}

export function Header({ view, onView, level, onLevel }: Props) {
  return (
    <header>
      <div className="brand">
        <div className="mark">V</div>
        Voters&nbsp;of&nbsp;Tomorrow <span className="sub">2026 Operations</span>
      </div>

      <div className="views">
        {VIEWS.map((v) => (
          <button key={v.key} aria-pressed={view === v.key} onClick={() => onView(v.key)}>
            {v.label}
          </button>
        ))}
      </div>

      {/* The level switch only means anything on the map. */}
      <div className="levels" style={{ marginLeft: 0, display: view === 'map' ? '' : 'none' }}>
        {LEVELS.map((l) => (
          <button key={l.key} aria-pressed={level === l.key} onClick={() => onLevel(l.key)}>
            {l.label}
          </button>
        ))}
      </div>
    </header>
  )
}
