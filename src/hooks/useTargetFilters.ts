import { useCallback, useMemo, useState } from 'react'
import { TARGET_ORDER, type TargetType } from '../data/tiers'
import { STATES } from '../data/states'

/** Filter keys: one per target type. */
export type TargetFilterKey = TargetType

export const TARGET_FILTER_KEYS: TargetFilterKey[] = [...TARGET_ORDER]

export interface TargetFilters {
  filters: Record<TargetFilterKey, boolean>
  setFilter: (key: TargetFilterKey, on: boolean) => void
  setAll: (on: boolean) => void
  /** A state's checked target types, in ranked order. Empty means filtered out. */
  activeTypes: (abbr: string) => TargetType[]
  /**
   * The checked subset of an explicit, already-ranked type list. Districts carry their
   * own designations, which are not always their state's.
   */
  activeTypesOf: (types: readonly TargetType[]) => TargetType[]
  /** True when the state has at least one checked target type. */
  isVisible: (abbr: string) => boolean
  /** Every state currently on the board, abbreviations only. */
  visibleStates: string[]
}

/**
 * The target-type filters, shared by all three tabs — the calendar and the Quick
 * Facts feed stay scoped to whatever board the map is showing.
 */
export function useTargetFilters(): TargetFilters {
  // Built from the key list rather than spelled out, so adding a target type does not
  // need a matching edit here to become filterable.
  const allFilters = (on: boolean): Record<TargetFilterKey, boolean> =>
    Object.fromEntries(TARGET_FILTER_KEYS.map((k) => [k, on])) as Record<
      TargetFilterKey,
      boolean
    >

  const [filters, setFilters] = useState<Record<TargetFilterKey, boolean>>(() =>
    allFilters(true),
  )

  const setFilter = useCallback((key: TargetFilterKey, on: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: on }))
  }, [])

  const setAll = useCallback((on: boolean) => {
    setFilters(allFilters(on))
  }, [])

  const activeTypes = useCallback(
    (abbr: string): TargetType[] => STATES[abbr]?.types.filter((t) => filters[t]) ?? [],
    [filters],
  )

  const activeTypesOf = useCallback(
    (types: readonly TargetType[]): TargetType[] => types.filter((t) => filters[t]),
    [filters],
  )

  const isVisible = useCallback((abbr: string) => activeTypes(abbr).length > 0, [activeTypes])

  const visibleStates = useMemo(() => Object.keys(STATES).filter(isVisible), [isVisible])

  return { filters, setFilter, setAll, activeTypes, activeTypesOf, isVisible, visibleStates }
}
