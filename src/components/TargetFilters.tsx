import { TARGET_ORDER, TIER } from '../data/tiers'
import type { TargetFilters as Filters } from '../hooks/useTargetFilters'

/**
 * The map sidebar. These filters are shared by both tabs, so unchecking Development
 * here also drops development-only states from the calendar.
 */
export function TargetFilters({ filters, setFilter, setAll }: Filters) {
  return (
    <aside className="filters">
      <div className="fgroup">
        <h3>Target type</h3>
        {TARGET_ORDER.map((key) => (
          <label className="chk" key={key}>
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={(e) => setFilter(key, e.target.checked)}
            />
            <span className="swatch" style={{ background: TIER[key].color }} />
            {TIER[key].label}
          </label>
        ))}
      </div>

      <div className="linkrow">
        <button onClick={() => setAll(true)}>Select all</button>
        <button onClick={() => setAll(false)}>Clear all</button>
      </div>

      <div className="fdiv" />

      <div className="fnote">
        States carrying more than one checked target show alternating stripes, the
        strongest as the field.
      </div>
    </aside>
  )
}
