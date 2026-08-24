import { useEffect, useRef, useState } from 'react'

export type View = 'map' | 'cal' | 'list' | 'stories'

/** The Airtable forms behind the States and Districts tables the board is synced from. */
const ADD_TARGET_FORMS: { label: string; href: string }[] = [
  {
    label: 'New Target District',
    href: 'https://airtable.com/appwnA2eTd4GfxZWE/pag6a6EcKXMQsrQPq/form',
  },
  {
    label: 'New Target State',
    href: 'https://airtable.com/appwnA2eTd4GfxZWE/pagJ2RdGSjbbFQ7CI/form',
  },
]

/**
 * Links out to the forms that add a target. Nothing here writes to Airtable — a target
 * added through one of these reaches the board on the next `npm run sync`.
 */
function AddTarget() {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  // A menu that outlives a click elsewhere, or Escape, is a menu you have to fight.
  useEffect(() => {
    if (!open) return

    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="addtarget" ref={wrap}>
      <button aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Add New Target <span aria-hidden="true">{open ? '\u25B4' : '\u25BE'}</span>
      </button>

      {open && (
        <div className="atmenu" role="menu">
          {ADD_TARGET_FORMS.map((f) => (
            <a
              key={f.href}
              role="menuitem"
              href={f.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {f.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
const SPATIAL_VIEWS: { key: View; label: string }[] = [
  { key: 'map', label: 'Map' },
  { key: 'list', label: 'List' },
]

const TEMPORAL_VIEWS: { key: View; label: string }[] = [{ key: 'cal', label: 'Event Calendar' }]

const STORY_VIEWS: { key: View; label: string }[] = [{ key: 'stories', label: 'Story Bank' }]

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
        {SPATIAL_VIEWS.map((v) => (
          <button key={v.key} aria-pressed={view === v.key} onClick={() => onView(v.key)}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="views">
        {TEMPORAL_VIEWS.map((v) => (
          <button key={v.key} aria-pressed={view === v.key} onClick={() => onView(v.key)}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="views">
        {STORY_VIEWS.map((v) => (
          <button key={v.key} aria-pressed={view === v.key} onClick={() => onView(v.key)}>
            {v.label}
          </button>
        ))}
      </div>

      <AddTarget />
    </header>
  )
}
