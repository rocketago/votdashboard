import { useMemo } from 'react'
import { CAMPUSES } from '../../data/campuses'
import { TARGETS } from '../../data/targets'
import { TARGET_ORDER, TIER } from '../../data/tiers'
import type { TargetFilters } from '../../hooks/useTargetFilters'

interface Props {
  filters: TargetFilters['filters']
  activeTypesOf: TargetFilters['activeTypesOf']
  isVisible: TargetFilters['isVisible']
}

/** Campuses indexed by district id for fast lookup. */
const CAMPUSES_BY_DISTRICT = CAMPUSES.reduce<Record<string, typeof CAMPUSES>>(
  (acc, c) => {
    ;(acc[c.district] ??= []).push(c)
    return acc
  },
  {},
)

export function ListView({ filters, activeTypesOf, isVisible }: Props) {
  const groups = useMemo(() => {
    return TARGET_ORDER.map((groupType) => {
      // A target lands in this group when the first type that survives the filter is groupType.
      const targets = TARGETS.filter((t) => {
        const active = activeTypesOf(t.types)
        return active.length > 0 && active[0] === groupType
      })

      return { groupType, spec: TIER[groupType], targets }
    }).filter((g) => g.targets.length > 0)
  }, [filters, activeTypesOf, isVisible])

  const totalActive = useMemo(
    () => TARGETS.filter((t) => activeTypesOf(t.types).length > 0).length,
    [activeTypesOf],
  )

  return (
    <div className="listwrap">
      <div className="listhead">
        <h2>Target Board</h2>
        <p className="listsub">
          {totalActive} {totalActive === 1 ? 'target' : 'targets'} on the board
        </p>
      </div>

      <div className="listbody">
        {groups.length === 0 && (
          <p className="listempty">No targets match the current filters.</p>
        )}

        {groups.map(({ groupType, spec, targets }) => (
          <section key={groupType} className="listgroup">
            <header className="listgroup-hd">
              <span className="listgroup-swatch" style={{ background: spec.color }} />
              <span className="listgroup-name">{spec.label}</span>
              <span className="listgroup-count">{targets.length}</span>
            </header>

            <div className="chips">
              {targets.map((t) => {
                const active = activeTypesOf(t.types)
                const dominant = active[0]!
                const domSpec = TIER[dominant]
                const secondary = active.slice(1)
                // Campuses linked to this district, if it's a House race.
                const linkedCampuses =
                  t.scope === 'house' && isVisible(t.state)
                    ? (CAMPUSES_BY_DISTRICT[t.id] ?? [])
                    : []

                return (
                  <span key={t.id} className="chip-wrap">
                    <span
                      className="chip"
                      style={
                        {
                          '--chip-bg': domSpec.color,
                          '--chip-fg': domSpec.text,
                        } as React.CSSProperties
                      }
                    >
                      <span className="chip-id">
                        {t.scope === 'state' ? `${t.id} statewide` : t.id}
                      </span>
                      {secondary.map((s) => (
                        <span
                          key={s}
                          className="chip-dot"
                          style={{ background: TIER[s].color }}
                          title={TIER[s].label}
                        />
                      ))}
                    </span>
                    {linkedCampuses.length > 0 && (
                      <span
                        className="chip-campus-row"
                        style={
                          {
                            '--campus-color': domSpec.color,
                          } as React.CSSProperties
                        }
                      >
                        {linkedCampuses.map((c) => (
                          <span key={c.name} className="chip-campus" title={c.name}>
                            {c.name}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
