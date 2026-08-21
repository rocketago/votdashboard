import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { Topology, GeometryCollection } from 'topojson-specification'

/**
 * Map geometry loading.
 *
 * Everything is served from `public/geo/`, never a CDN, so swapping in new
 * boundaries is a file drop plus (for districts) one line in the manifest — no code
 * change and no rebuild of the JS bundle. See `public/geo/README.md`.
 */

const GEO_BASE = `${import.meta.env.BASE_URL}geo`

export type StateFeature = Feature<Geometry> & { abbr: string }
export type DistrictFeature = Feature<Geometry> & { district: string }

/** State outlines. One request, cached for the life of the page. */
let statesPromise: Promise<StateFeature[]> | null = null

export function loadStates(): Promise<StateFeature[]> {
  statesPromise ??= fetch(`${GEO_BASE}/states.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`states.json: ${r.status}`)
      return r.json() as Promise<Topology<{ states: GeometryCollection }>>
    })
    .then((topology) => {
      const fc = feature(topology, topology.objects.states) as FeatureCollection<Geometry>
      return fc.features
        .filter((f) => typeof f.properties?.['abbr'] === 'string')
        .map((f) => Object.assign(f, { abbr: f.properties!['abbr'] as string }))
    })

  return statesPromise
}

/* ---------------- congressional districts ---------------- */

export interface DistrictManifest {
  /** Shown in the state map header, e.g. `'119th Congress'`. */
  label: string
  /** State abbreviations that have a `<ABBR>.json` file alongside the manifest. */
  states: string[]
}

/**
 * Property names checked, in order, when reading a district number off a feature.
 * Covers a raw Census TIGER/cartographic export (`CD119FP`), the older per-Congress
 * variants, and hand-rolled files (`district`).
 */
const DISTRICT_PROPS = [
  'district', 'DISTRICT', 'CD119FP', 'CD118FP', 'CD117FP', 'CD116FP',
  'CD115FP', 'CD114FP', 'CD113FP', 'CDFP', 'cd', 'DISTRICTNO',
]

/** Reads a district number off a feature and normalises it to two digits. */
function districtNumberOf(f: Feature<Geometry>, index: number): string {
  const props = (f.properties ?? {}) as Record<string, unknown>

  for (const key of DISTRICT_PROPS) {
    const raw = props[key]
    if (raw === undefined || raw === null || raw === '') continue
    const digits = String(raw).match(/\d+/)?.[0]
    if (digits !== undefined) return digits.padStart(2, '0')
  }

  // At-large states are sometimes labelled by name only, with no numeric field.
  const named = String(props['NAMELSAD'] ?? props['name'] ?? '')
  if (/at.large/i.test(named)) return '00'
  const fromName = named.match(/\d+/)?.[0]
  if (fromName !== undefined) return fromName.padStart(2, '0')

  return String(index + 1).padStart(2, '0')
}

let manifestPromise: Promise<DistrictManifest | null> | null = null

export function loadDistrictManifest(): Promise<DistrictManifest | null> {
  manifestPromise ??= fetch(`${GEO_BASE}/districts/manifest.json`)
    .then((r) => (r.ok ? (r.json() as Promise<DistrictManifest>) : null))
    .catch(() => null)

  return manifestPromise
}

const districtCache = new Map<string, DistrictFeature[]>()

/**
 * Districts for one state. Resolves to an empty array when no boundaries are
 * installed for it — callers render the "unavailable" state rather than failing.
 */
export async function loadDistricts(abbr: string): Promise<DistrictFeature[]> {
  const cached = districtCache.get(abbr)
  if (cached) return cached

  const manifest = await loadDistrictManifest()
  if (!manifest?.states.includes(abbr)) {
    districtCache.set(abbr, [])
    return []
  }

  try {
    const res = await fetch(`${GEO_BASE}/districts/${abbr}.json`)
    if (!res.ok) throw new Error(`${abbr}.json: ${res.status}`)
    const fc = (await res.json()) as FeatureCollection<Geometry>

    const features = (fc.features ?? []).map((f, i) =>
      Object.assign(f, { district: districtNumberOf(f, i) }),
    )
    districtCache.set(abbr, features)
    return features
  } catch (err) {
    console.warn(`No district boundaries for ${abbr}`, err)
    districtCache.set(abbr, [])
    return []
  }
}

/** Read synchronously by the map header; `null` until the manifest has loaded. */
export function cachedDistricts(abbr: string): DistrictFeature[] | null {
  return districtCache.get(abbr) ?? null
}
