export type View = 'map' | 'cal'
const VIEWS: { key: View; label: string }[] = [
  { key: 'map', label: 'Map' },
  { key: 'cal', label: 'Calendar' },
]

interface Props {
  view: View
  onView: (view: View) => void
}

export function Header({ view, onView }: Props) {
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

    </header>
  )
}
