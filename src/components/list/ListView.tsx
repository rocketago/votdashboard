import { useMemo } from 'react'
import { TARGETS } from '../../data/targets'
import { TARGET_ORDER, TIER } from '../../data/tiers'
import type { TargetFilters } from '../../hooks/useTargetFilters'

interface Props {
  filters: TargetFilters['filters']
  activeTypesOf: TargetFilters['activeTypesOf']
  isVisible: TargetFilters['isVisible']
}

export function ListView({ filters, activeTypesOf }: Props) {
  const groups = useMemo(() => {
    return TARGET_ORDER.map((groupType) => {
      // A target appears in every group whose type is active on that target.
      const targets = TARGETS.filter((t) => {
        const active = activeTypesOf(t.types)
        return active.includes(groupType)
      })

      return { groupType, spec: TIER[groupType], targets }
    }).filter((g) => g.targets.length > 0)
  }, [filters, activeTypesOf])

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
              {targets.map((t) => (
                <span
                  key={t.id}
                  className="chip"
                  style={
                    {
                      '--chip-bg': spec.color,
                      '--chip-fg': spec.text,
                    } as React.CSSProperties
                  }
                >
                  <span className="chip-id">
                    {t.scope === 'state' ? `${t.id} statewide` : t.id}
                  </span>
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
