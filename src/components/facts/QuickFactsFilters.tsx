import { NATIONAL } from '../../data/quickFacts'
import type { ScopeFilters } from '../../hooks/useScopeFilters'

/** Filters the feed by district. The whole tree is derived from the feed's own scopes. */
export function QuickFactsFilters({ index, checked, setChecked, setAll }: ScopeFilters) {
  return (
    <aside className="filters">
      <div className="fgroup">
        <h3>Applies to</h3>

        {index.hasNational && (
          <>
            <label className="chk">
              <input
                type="checkbox"
                checked={checked[NATIONAL] ?? false}
                onChange={(e) => setChecked(NATIONAL, e.target.checked)}
              />
              National
            </label>
            <div className="fdiv" style={{ margin: '12px 0' }} />
          </>
        )}

        {index.states.map((state) => {
          const entry = index.byState[state]!
          return (
            <div className="dgrp" key={state}>
              <span className="st">{state}</span>

              {entry.statewide && (
                <label className="chk">
                  <input
                    type="checkbox"
                    checked={checked[state] ?? false}
                    onChange={(e) => setChecked(state, e.target.checked)}
                  />
                  Statewide
                </label>
              )}

              {entry.districts.map((d) => {
                const key = `${state}-${d}`
                return (
                  <label className="chk" key={key}>
                    <input
                      type="checkbox"
                      checked={checked[key] ?? false}
                      onChange={(e) => setChecked(key, e.target.checked)}
                    />
                    <span className="cd">{key}</span>
                  </label>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="linkrow">
        <button onClick={() => setAll(true)}>Select all</button>
        <button onClick={() => setAll(false)}>Clear all</button>
      </div>

      <div className="fdiv" />

      <div className="fnote">
        A blurb shows if any district it covers is checked. Chips on each blurb open that
        state on the map.
      </div>
    </aside>
  )
}
