import { useCallback, useMemo, useState } from 'react'
import { TARGET_ORDER, type TargetType } from '../data/tiers'
import { STATES } from '../data/states'

/** Filter keys: the three target types plus the chapter-status overlay. */
export type TargetFilterKey = TargetType | 'chapter'

export const TARGET_FILTER_KEYS: TargetFilterKey[] = [...TARGET_ORDER, 'chapter']

export interface TargetFilters {
  filters: Record<TargetFilterKey, boolean>
  setFilter: (key: TargetFilterKey, on: boolean) => void
  setAll: (on: boolean) => void
  /** A state's checked target types, in ranked order. Empty means filtered out. */
  activeTypes: (abbr: string) => TargetType[]
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
  const [filters, setFilters] = useState<Record<TargetFilterKey, boolean>>({
    soft: true,
    hard: true,
    dev: true,
    chapter: true,
  })

  const setFilter = useCallback((key: TargetFilterKey, on: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: on }))
  }, [])

  const setAll = useCallback((on: boolean) => {
    setFilters({ soft: on, hard: on, dev: on, chapter: on })
  }, [])

  const activeTypes = useCallback(
    (abbr: string): TargetType[] => STATES[abbr]?.types.filter((t) => filters[t]) ?? [],
    [filters],
  )

  const isVisible = useCallback((abbr: string) => activeTypes(abbr).length > 0, [activeTypes])

  const visibleStates = useMemo(() => Object.keys(STATES).filter(isVisible), [isVisible])

  return { filters, setFilter, setAll, activeTypes, isVisible, visibleStates }
}
