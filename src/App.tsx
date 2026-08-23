import { useCallback, useRef, useState } from 'react'

import { Header, type MapLevel, type View } from './components/Header'
import { TargetFilters } from './components/TargetFilters'
import { MapView } from './components/map/MapView'
import { DetailPanel } from './components/DetailPanel'
import { CalendarFilters } from './components/calendar/CalendarFilters'
import { CalendarView } from './components/calendar/CalendarView'
import { QuickFactsFilters } from './components/facts/QuickFactsFilters'
import { QuickFactsView } from './components/facts/QuickFactsView'
import { useTargetFilters } from './hooks/useTargetFilters'
import { useScopeFilters } from './hooks/useScopeFilters'
import type { ProgramType } from './data/events'

export function App() {
  const [view, setView] = useState<View>('map')
  const [level, setLevel] = useState<MapLevel>('states')
  const [selected, setSelected] = useState<string | null>(null)

  const targets = useTargetFilters()
  const scopes = useScopeFilters()

  const [programFilters, setProgramFilters] = useState<Record<ProgramType, boolean>>({
    hip: true,
    hd: true,
    sip: true,
    sd: true,
  })

  const setProgramFilter = useCallback((type: ProgramType, on: boolean) => {
    setProgramFilters((prev) => ({ ...prev, [type]: on }))
  }, [])

  /**
   * The panel keeps rendering the last state it showed while the column animates
   * closed, so the content does not blank out mid-transition.
   */
  const lastSelected = useRef<string | null>(null)
  if (selected) lastSelected.current = selected

  const closePanel = useCallback(() => setSelected(null), [])

  const changeView = useCallback((next: View) => {
    setView(next)
    // Leaving the map drops the zoomed state, matching the map's own close button.
    if (next !== 'map') setSelected(null)
  }, [])

  const changeLevel = useCallback((next: MapLevel) => {
    setLevel(next)
    // The level switch only applies to the national board, so back out of a zoom.
    setSelected(null)
  }, [])

  /** Chips in the calendar and the feed jump to that state on the map. */
  const openState = useCallback((abbr: string) => {
    setView('map')
    setSelected(abbr)
  }, [])

  const mainClass = [
    view === 'map' && selected ? 'open' : '',
    view === 'cal' ? 'calview' : '',
    view === 'facts' ? 'factview' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="app">
      <Header view={view} onView={changeView} level={level} onLevel={changeLevel} />

      <main className={mainClass}>
        {view === 'map' && (
          <>
            <TargetFilters {...targets} />
            <MapView
              level={level}
              targets={targets}
              selected={selected}
              onSelect={setSelected}
              onClose={closePanel}
            />
            {/* `abbr` falls back to the last selection so the panel keeps its content
                while it slides shut; `open` is the honest state, and what the panel
                resets itself on. */}
            <DetailPanel
              abbr={selected ?? lastSelected.current}
              open={selected !== null}
              onClose={closePanel}
            />
          </>
        )}

        {view === 'cal' && (
          <>
            <CalendarFilters
              programFilters={programFilters}
              setProgramFilter={setProgramFilter}
              isVisible={targets.isVisible}
            />
            <CalendarView
              programFilters={programFilters}
              isVisible={targets.isVisible}
              onOpenState={openState}
            />
          </>
        )}

        {view === 'facts' && (
          <>
            <QuickFactsFilters {...scopes} />
            <QuickFactsView
              checked={scopes.checked}
              isVisible={targets.isVisible}
              onOpenState={openState}
            />
          </>
        )}
      </main>
    </div>
  )
}
