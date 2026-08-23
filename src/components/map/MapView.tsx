import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { geoAlbersUsa, geoConicConformal, geoPath } from 'd3-geo'
import type { FeatureCollection, Geometry } from 'geojson'

import { COLORS, TIER, type TargetType } from '../../data/tiers'
import { STATES, districtNumber } from '../../data/states'
import { CAMPUSES, campusType, campusesIn } from '../../data/campuses'
import { eventsIn } from '../../data/events'
import {
  cachedDistricts,
  loadDistrictManifest,
  loadDistricts,
  loadStates,
  type DistrictFeature,
  type StateFeature,
} from '../../lib/geo'
import { useElementSize } from '../../hooks/useElementSize'
import type { TargetFilters } from '../../hooks/useTargetFilters'
import type { MapLevel } from '../Header'
import { StripePatterns, stripeFill } from './stripes'

/** States too small to carry a centroid label without colliding with their neighbours. */
const SMALL = new Set(['RI', 'DE', 'DC', 'CT', 'NJ', 'MD', 'MA', 'NH', 'VT'])

interface Props {
  level: MapLevel
  targets: TargetFilters
  selected: string | null
  onSelect: (abbr: string) => void
  onClose: () => void
}

interface Tip {
  text: string
  x: number
  y: number
}

export function MapView({ level, targets, selected, onSelect, onClose }: Props) {
  const [wrapRef, { width, height }] = useElementSize<HTMLDivElement>()
  const [states, setStates] = useState<StateFeature[]>([])
  const [districts, setDistricts] = useState<DistrictFeature[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [districtLabel, setDistrictLabel] = useState<string | null>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const { activeTypes, isVisible, visibleStates, filters } = targets

  useEffect(() => {
    let cancelled = false
    loadStates().then((f) => {
      if (!cancelled) setStates(f)
    })
    loadDistrictManifest().then((m) => {
      if (!cancelled) setDistrictLabel(m?.label ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // District boundaries for the selected state, if any are installed.
  useEffect(() => {
    if (!selected) {
      setDistricts([])
      setLoadingDistricts(false)
      return
    }

    const cached = cachedDistricts(selected)
    if (cached) {
      setDistricts(cached)
      setLoadingDistricts(false)
      return
    }

    let cancelled = false
    setDistricts([])
    setLoadingDistricts(true)

    loadDistricts(selected).then((features) => {
      if (cancelled) return
      setDistricts(features)
      setLoadingDistricts(false)
    })

    return () => {
      cancelled = true
    }
  }, [selected])

  const selectedFeature = useMemo(
    () => (selected ? states.find((f) => f.abbr === selected) ?? null : null),
    [states, selected],
  )

  /**
   * National view uses Albers USA (which insets AK and HI); a zoomed state uses a
   * conic conformal fitted to its districts, falling back to the state outline while
   * boundaries load or when none are installed.
   */
  const projection = useMemo(() => {
    if (!states.length || !width || !height) return null

    if (selectedFeature) {
      const fit: FeatureCollection<Geometry> = {
        type: 'FeatureCollection',
        features: districts.length ? districts : [selectedFeature],
      }
      return geoConicConformal()
        .parallels([33, 45])
        .rotate([96, 0])
        .fitExtent(
          [
            [34, 92],
            [width - 34, height - 34],
          ],
          fit,
        )
    }

    return geoAlbersUsa().fitExtent(
      [
        [34, 34],
        [width - 34, height - 92],
      ],
      { type: 'FeatureCollection', features: states },
    )
  }, [states, width, height, selectedFeature, districts])

  const path = useMemo(() => (projection ? geoPath(projection) : null), [projection])

  /** Every multi-type combination on the board right now, for the <defs> patterns. */
  const combos = useMemo(() => {
    const seen = new Map<string, TargetType[]>()
    for (const abbr of visibleStates) {
      const types = activeTypes(abbr)
      if (types.length > 1) seen.set(types.join('-'), types)
    }
    return [...seen.values()]
  }, [visibleStates, activeTypes])

  const showTip = (e: MouseEvent, text: string) => {
    const rect = e.currentTarget.closest('.mapwrap')?.getBoundingClientRect()
    if (!rect) return
    setTip({ text, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 8 })
  }
  const hideTip = () => setTip(null)

  const stateMode = selected !== null && selectedFeature !== null

  return (
    <div className="mapwrap" ref={wrapRef}>
      <svg id="map" viewBox={width && height ? `0 0 ${width} ${height}` : undefined}>
        <StripePatterns combos={combos} />
        {path &&
          (stateMode ? (
            <StateLayers
              abbr={selected!}
              states={states}
              districts={districts}
              path={path}
              projection={projection!}
              activeTypes={activeTypes}
              onTip={showTip}
              onTipOut={hideTip}
            />
          ) : (
            <NationalLayers
              states={states}
              path={path}
              projection={projection!}
              level={level}
              selected={selected}
              showChapters={filters.chapter}
              activeTypes={activeTypes}
              isVisible={isVisible}
              onSelect={onSelect}
              onTip={showTip}
              onTipOut={hideTip}
            />
          ))}
      </svg>

      <div id="tip" style={tip ? { left: tip.x, top: tip.y, opacity: 1 } : undefined}>
        {tip?.text}
      </div>

      {stateMode ? (
        <StateOverlay
          abbr={selected!}
          districts={districts}
          loading={loadingDistricts}
          districtLabel={districtLabel}
          activeTypes={activeTypes}
          onClose={onClose}
        />
      ) : (
        <>
          <StatsBar visibleStates={visibleStates} />
          <div className="hint">
            {level === 'campuses'
              ? 'Dots are campus programs · click a state for detail'
              : 'Click a state for detail'}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- national view ---------------- */

type Projection = NonNullable<ReturnType<typeof geoAlbersUsa>>
type Path = ReturnType<typeof geoPath>

interface NationalProps {
  states: StateFeature[]
  path: Path
  projection: Projection
  level: MapLevel
  selected: string | null
  showChapters: boolean
  activeTypes: (abbr: string) => TargetType[]
  isVisible: (abbr: string) => boolean
  onSelect: (abbr: string) => void
  onTip: (e: MouseEvent, text: string) => void
  onTipOut: () => void
}

function NationalLayers({
  states,
  path,
  projection,
  level,
  selected,
  showChapters,
  activeTypes,
  isVisible,
  onSelect,
  onTip,
  onTipOut,
}: NationalProps) {
  const campusLevel = level === 'campuses'

  const stateTipText = (abbr: string) => {
    const record = STATES[abbr]
    if (!record || !isVisible(abbr)) return `${abbr} · not targeted`
    const labels = activeTypes(abbr).map((t) => TIER[t].label).join(' + ')
    return `${abbr} · ${labels} · ${record.reg.toLocaleString()} reg`
  }

  return (
    <>
      <g>
        {states.map((f) => (
          <path
            key={f.abbr}
            className={`state${selected === f.abbr ? ' sel' : ''}`}
            d={path(f) ?? undefined}
            fill={stripeFill(activeTypes(f.abbr), COLORS.land)}
            fillOpacity={isVisible(f.abbr) ? (campusLevel ? 0.5 : 0.86) : 1}
            onMouseMove={(e) => onTip(e, stateTipText(f.abbr))}
            onMouseLeave={onTipOut}
            onClick={() => onSelect(f.abbr)}
          />
        ))}
      </g>

      <g style={{ opacity: campusLevel ? 0.35 : 1 }}>
        {states
          .filter((f) => !SMALL.has(f.abbr))
          .map((f) => {
            const [cx, cy] = path.centroid(f)
            return (
              <text
                key={f.abbr}
                className="slabel"
                transform={`translate(${cx},${cy + 3})`}
                fillOpacity={isVisible(f.abbr) ? 0.62 : 0.22}
              >
                {f.abbr}
              </text>
            )
          })}
      </g>

      {showChapters && (
        <g>
          {states
            .filter((f) => isVisible(f.abbr) && STATES[f.abbr]?.chapter === 'established')
            .map((f) => {
              const [cx, cy] = path.centroid(f)
              return (
                <circle
                  key={f.abbr}
                  className="chapdot"
                  cx={cx}
                  cy={cy - 13}
                  r={3.4}
                  fill="none"
                  stroke={COLORS.chapter}
                  strokeWidth={1.6}
                />
              )
            })}
        </g>
      )}

      {level === 'districts' && (
        <g>
          {states
            .filter((f) => isVisible(f.abbr) && (STATES[f.abbr]?.districts.length ?? 0) > 0)
            .map((f) => {
              const [cx, cy] = path.centroid(f)
              return (
                <g key={f.abbr} className="dchip" transform={`translate(${cx},${cy + 14})`}>
                  <rect
                    x={-11}
                    y={-8}
                    width={22}
                    height={14}
                    fill={COLORS.ink}
                    stroke="rgba(255,255,255,.35)"
                  />
                  <text
                    textAnchor="middle"
                    y={2.5}
                    fontFamily="IBM Plex Mono"
                    fontSize={9.5}
                    fontWeight={600}
                    fill="#fff"
                  >
                    {STATES[f.abbr]!.districts.length}D
                  </text>
                </g>
              )
            })}
        </g>
      )}

      {campusLevel && (
        <g>
          {CAMPUSES.filter((c) => isVisible(c.state)).map((c) => {
            const point = projection([c.lon, c.lat])
            if (!point) return null
            return (
              <g
                key={c.name}
                className="campus"
                transform={`translate(${point[0]},${point[1]})`}
                onMouseMove={(e) => onTip(e, c.name)}
                onMouseLeave={onTipOut}
                onClick={() => onSelect(c.state)}
              >
                <circle r={5.5} fill={TIER[campusType(c)].color} stroke={COLORS.ink} strokeWidth={1.4} />
              </g>
            )
          })}
        </g>
      )}
    </>
  )
}

/* ---------------- zoomed state view ---------------- */

interface StateProps {
  abbr: string
  states: StateFeature[]
  districts: DistrictFeature[]
  path: Path
  projection: Projection
  activeTypes: (abbr: string) => TargetType[]
  onTip: (e: MouseEvent, text: string) => void
  onTipOut: () => void
}

/** The district numbers a state targets, e.g. `AZ-01` -> `01`. */
function targetedDistricts(abbr: string): Set<string> {
  return new Set((STATES[abbr]?.districts ?? []).map(districtNumber))
}

function tierColorFor(abbr: string, activeTypes: (abbr: string) => TargetType[]): string {
  const active = activeTypes(abbr)
  if (active.length) return TIER[active[0]!].color
  const record = STATES[abbr]
  return record ? TIER[record.tier].color : '#4a5566'
}

function StateLayers({
  abbr,
  states,
  districts,
  path,
  projection,
  activeTypes,
  onTip,
  onTipOut,
}: StateProps) {
  const targeted = targetedDistricts(abbr)
  const tierColor = tierColorFor(abbr, activeTypes)
  const campuses = campusesIn(abbr)

  return (
    <>
      <g>
        {states.map((f) => (
          <path
            key={f.abbr}
            className="state"
            d={path(f) ?? undefined}
            fill={f.abbr === abbr ? COLORS.selectedLand : COLORS.land}
            fillOpacity={f.abbr === abbr ? 1 : 0.5}
            stroke={COLORS.ink}
            pointerEvents="none"
          />
        ))}
      </g>

      <g>
        {districts.map((f) => {
          const isTarget = targeted.has(f.district)
          return (
            <path
              key={f.district}
              className="cd"
              d={path(f) ?? undefined}
              fill={isTarget ? tierColor : COLORS.districtOther}
              fillOpacity={isTarget ? 0.92 : 0.85}
              onMouseMove={(e) =>
                onTip(
                  e,
                  `${abbr}-${f.district}${isTarget ? ' · target district' : ' · not targeted'}`,
                )
              }
              onMouseLeave={onTipOut}
            />
          )
        })}

        {/* Above roughly two dozen districts the labels stop being legible. */}
        {districts.length > 0 &&
          districts.length <= 24 &&
          districts.map((f) => {
            const [cx, cy] = path.centroid(f)
            return (
              <text key={f.district} className="cdlabel" transform={`translate(${cx},${cy + 4})`}>
                {f.district.replace(/^0/, '')}
              </text>
            )
          })}
      </g>

      <g>
        {campuses.map((c) => {
          const point = projection([c.lon, c.lat])
          if (!point) return null
          return (
            <g
              key={c.name}
              className="campus"
              transform={`translate(${point[0]},${point[1]})`}
              onMouseMove={(e) => onTip(e, c.name)}
              onMouseLeave={onTipOut}
            >
              <circle
                r={5}
                fill={COLORS.chapter}
                stroke={COLORS.chapter}
                strokeWidth={1.4}
              />
              <text
                x={9}
                y={3.5}
                fontSize={10.5}
                fontFamily="IBM Plex Sans"
                fill="rgba(255,255,255,.82)"
                paintOrder="stroke"
                stroke="rgba(13,16,22,.8)"
                strokeWidth={3}
              >
                {c.name}
              </text>
            </g>
          )
        })}
      </g>
    </>
  )
}

interface OverlayProps {
  abbr: string
  districts: DistrictFeature[]
  loading: boolean
  districtLabel: string | null
  activeTypes: (abbr: string) => TargetType[]
  onClose: () => void
}

function StateOverlay({
  abbr,
  districts,
  loading,
  districtLabel,
  activeTypes,
  onClose,
}: OverlayProps) {
  const targeted = targetedDistricts(abbr)
  const tierColor = tierColorFor(abbr, activeTypes)

  // Count the districts actually drawn and highlighted rather than the target list,
  // so the header can never claim more targets than the map shows — which is exactly
  // what surfaces a target list that has drifted from the installed boundaries.
  const drawnTargets = districts.filter((f) => targeted.has(f.district)).length

  const subtitle = districts.length
    ? [
        `${districts.length} districts`,
        `${drawnTargets} targeted`,
        ...(districtLabel ? [districtLabel] : []),
      ].join(' · ')
    : 'congressional map'

  return (
    <>
      <div className="statehdr">
        <div>
          <div className="nm">{STATES[abbr]?.name ?? abbr}</div>
          <div className="sb">{subtitle}</div>
        </div>
        <button onClick={onClose}>&larr; National map</button>
      </div>

      <div className="cdkey">
        <div>
          <i style={{ background: tierColor }} />
          Target district
        </div>
        <div>
          <i style={{ background: COLORS.districtOther }} />
          Other district
        </div>
        <div>
          <i style={{ background: COLORS.chapter, borderRadius: '50%' }} />
          Campus program
        </div>
      </div>

      {loading && <div className="loading">Loading district boundaries…</div>}
      {!loading && !districts.length && (
        <div className="loading">District boundaries unavailable</div>
      )}
    </>
  )
}

/* ---------------- running totals ---------------- */

function StatsBar({ visibleStates }: { visibleStates: string[] }) {
  const sum = (key: 'reg' | 'pledge') =>
    visibleStates.reduce((total, abbr) => total + (STATES[abbr]?.[key] ?? 0), 0)

  const cells: [string, string | number][] = [
    ['Target states', visibleStates.length],
    ['Voters registered', sum('reg').toLocaleString()],
    ['Pledges to vote', sum('pledge').toLocaleString()],
    ['Chapters', visibleStates.filter((a) => STATES[a]?.chapter === 'established').length],
    ['Events scheduled', visibleStates.reduce((n, a) => n + eventsIn(a).length, 0)],
  ]

  return (
    <div className="stats">
      {cells.map(([label, value]) => (
        <div key={label}>
          <div className="k">{label}</div>
          <div className="v mono">{value}</div>
        </div>
      ))}
    </div>
  )
}
