import { useMemo } from 'react'
import { NATIONAL, QUICK_FACTS, scopeKeys, type QuickFact } from '../../data/quickFacts'

interface Props {
  checked: Record<string, boolean>
  isVisible: (abbr: string) => boolean
  onOpenState: (abbr: string) => void
}

export function QuickFactsView({ checked, isVisible, onOpenState }: Props) {
  const items = useMemo(
    () =>
      QUICK_FACTS.filter((fact) => {
        // A blurb shows if any district it covers is checked...
        if (!scopeKeys(fact).some((key) => checked[key])) return false

        // ...and if at least one of its states is still on the board. National-only
        // blurbs always pass.
        const states = fact.scopes.filter((s) => s.state !== NATIONAL)
        return states.length === 0 || states.some((s) => isVisible(s.state))
      }),
    [checked, isVisible],
  )

  return (
    <div className="factwrap">
      <div className="fhead">
        <h2>Quick facts</h2>
        <p>
          Messaging the organizing team can use as written. Each blurb is scoped to the
          states and districts it holds up in.
        </p>
      </div>

      <div className="factnote">
        Sample copy. Figures are placeholders pending the research team sign-off.
      </div>

      <div className="feed">
        {items.length === 0 ? (
          <div className="item">
            <p className="empty">No blurbs match the current filters.</p>
          </div>
        ) : (
          items.map((fact) => (
            <FactItem key={fact.headline} fact={fact} onOpenState={onOpenState} />
          ))
        )}
      </div>
    </div>
  )
}

function FactItem({
  fact,
  onOpenState,
}: {
  fact: QuickFact
  onOpenState: (abbr: string) => void
}) {
  return (
    <div className="item">
      <div className="scope">
        {fact.scopes.map((scope) => {
          if (scope.state === NATIONAL) {
            return (
              <button className="nat" key="nat" disabled>
                NATIONAL
              </button>
            )
          }

          if (!scope.districts.length) {
            return (
              <button key={scope.state} onClick={() => onOpenState(scope.state)}>
                {scope.state} statewide
              </button>
            )
          }

          return scope.districts.map((d) => (
            <button key={`${scope.state}-${d}`} onClick={() => onOpenState(scope.state)}>
              {scope.state}-{d}
            </button>
          ))
        })}
        <span className="topic">{fact.topic}</span>
      </div>

      <h3>{fact.headline}</h3>
      <p>{fact.body}</p>
      <div className="use">
        Use for: <b>{fact.useFor}</b>
      </div>
    </div>
  )
}
