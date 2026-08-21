import { TARGET_ORDER, TIER } from '../data/tiers'
import type { TargetFilters as Filters } from '../hooks/useTargetFilters'

/**
 * The map sidebar. These filters are shared across all three tabs, so unchecking
 * Development here also drops development-only states from the calendar and feed.
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

      <div className="fdiv" />

      <div className="fgroup">
        <h3>Chapter status</h3>
        <label className="chk">
          <input
            type="checkbox"
            checked={filters.chapter}
            onChange={(e) => setFilter('chapter', e.target.checked)}
          />
          <span className="swatch" style={{ background: 'var(--chapter)' }} />
          Existing chapter
        </label>
      </div>

      <div className="linkrow">
        <button onClick={() => setAll(true)}>Select all</button>
        <button onClick={() => setAll(false)}>Clear all</button>
      </div>

      <div className="fdiv" />

      <div className="fnote">
        States carrying more than one checked target show alternating stripes. Ring marks an
        existing chapter.
      </div>
    </aside>
  )
}
