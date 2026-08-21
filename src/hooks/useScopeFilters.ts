import { useCallback, useMemo, useState } from 'react'
import { NATIONAL, QUICK_FACTS, buildScopeIndex, type ScopeIndex } from '../data/quickFacts'

export interface ScopeFilters {
  index: ScopeIndex
  checked: Record<string, boolean>
  setChecked: (key: string, on: boolean) => void
  setAll: (on: boolean) => void
}

/** Every filter key the Quick Facts sidebar offers, derived from the feed itself. */
function allKeys(index: ScopeIndex): string[] {
  const keys: string[] = []
  if (index.hasNational) keys.push(NATIONAL)
  for (const state of index.states) {
    const entry = index.byState[state]!
    if (entry.statewide) keys.push(state)
    for (const d of entry.districts) keys.push(`${state}-${d}`)
  }
  return keys
}

export function useScopeFilters(): ScopeFilters {
  const index = useMemo(() => buildScopeIndex(QUICK_FACTS), [])
  const keys = useMemo(() => allKeys(index), [index])

  const [checked, setCheckedState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(keys.map((k) => [k, true])),
  )

  const setChecked = useCallback((key: string, on: boolean) => {
    setCheckedState((prev) => ({ ...prev, [key]: on }))
  }, [])

  const setAll = useCallback(
    (on: boolean) => setCheckedState(Object.fromEntries(keys.map((k) => [k, on]))),
    [keys],
  )

  return { index, checked, setChecked, setAll }
}
