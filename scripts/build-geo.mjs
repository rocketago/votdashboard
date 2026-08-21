#!/usr/bin/env node
/**
 * Builds every piece of map geometry the app serves, from one congressional-district
 * shapefile.
 *
 *   npm run geo -- geo-src/congress.shp
 *   npm run geo -- geo-src/congress.shp --label "120th Congress"
 *
 * Writes `public/geo/districts/<ABBR>.json`, the manifest beside them, and the state
 * outlines in `public/geo/states.json`. See public/geo/README.md.
 *
 * The state outlines are dissolved from the districts rather than taken from a separate
 * source, so the two layers agree exactly. That matters at state zoom, where an outline
 * drawn from different data would show as a halo along the coast.
 *
 * Input must be in WGS84 lon/lat — check the .prj — and carry an `id` property of the
 * form `OH09`: two-letter state, two-digit district. Everything else is derived.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as shapefile from 'shapefile'
import { topology } from 'topojson-server'
import { feature as toFeatures } from 'topojson-client'
import { geoArea } from 'd3-geo'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const GEO_DIR = resolve(ROOT, 'public/geo')
const OUT_DIR = resolve(GEO_DIR, 'districts')

/**
 * Coordinate precision in the output. Five decimals is roughly a metre — far finer
 * than the source generalization, so it rounds without visibly moving anything.
 */
const PRECISION = 5

/**
 * Quantization grid for the state outlines, in steps across the bounding box.
 *
 * They ship as TopoJSON because the national view loads them before anything else:
 * shared borders are stored once instead of twice, and coordinates become integer
 * deltas. The bounding box spans nearly the whole globe — Alaska reaches across the
 * antimeridian — so the grid has to be fine to stay well under a pixel.
 */
const QUANTIZATION = 1e6

const VALID_ABBR = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO',
  'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
  'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
])

/* ---------------- arguments ---------------- */

const args = process.argv.slice(2)
const flagIndex = args.findIndex((a) => a === '--label')
const label = flagIndex === -1 ? null : args[flagIndex + 1]
const input = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--label')

if (!input) {
  console.error('usage: node scripts/build-geo.mjs <districts.shp> [--label "120th Congress"]')
  process.exit(1)
}

/* ---------------- rings ---------------- */

const round = (n) => Number(n.toFixed(PRECISION))
const key = ([x, y]) => `${x},${y}`

/**
 * Twice the signed area. Shapefiles wind outer rings clockwise and holes
 * counter-clockwise, which is how the two are told apart below.
 */
function signedArea(ring) {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    sum += x1 * y2 - x2 * y1
  }
  return sum
}

/**
 * Smallest ring worth keeping, in square degrees — about a square metre, so far below
 * any real island.
 *
 * Dissolving can leave zero-area slivers where a district boundary doubles back on
 * itself, and those are not merely useless: d3 reads a degenerate ring spherically and
 * can take it for the whole globe, filling the entire map. They are dropped here, and
 * the check at the end of the script would catch any that got through.
 */
const AREA_EPSILON = 1e-10

function contains(ring, [x, y]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/**
 * Sorts a flat list of rings into GeoJSON polygons, attaching each hole to the
 * smallest ring that encloses it. Rings that enclose nothing become their own
 * polygon, which is how offshore islands survive.
 */
function toPolygons(rings) {
  const kept = rings
    .map((ring) => ({ ring, area: signedArea(ring) }))
    .filter((r) => Math.abs(r.area) >= AREA_EPSILON)

  const polygons = kept
    .filter((r) => r.area < 0)
    .map((r) => ({ ring: r.ring, area: -r.area, holes: [] }))

  for (const hole of kept.filter((r) => r.area > 0)) {
    let host = null
    for (const polygon of polygons) {
      if (!contains(polygon.ring, hole.ring[0])) continue
      if (!host || polygon.area < host.area) host = polygon
    }

    if (host) {
      host.holes.push(hole.ring)
      continue
    }

    // A ring wound like a hole but enclosing nothing is an outline in its own right —
    // an island, or a sliver the dissolve walked backwards. It has to be reversed to
    // wind like every other outer ring: left as it is, d3 reads it spherically as
    // everything *except* itself, and one of them floods the whole map.
    polygons.push({ ring: hole.ring.slice().reverse(), area: hole.area, holes: [] })
  }

  return polygons.map((p) => [p.ring, ...p.holes])
}

/** Rounds a ring to the output precision, dropping any vertex that lands on the last. */
function tidy(ring) {
  const out = []
  for (const [x, y] of ring) {
    const point = [round(x), round(y)]
    const last = out[out.length - 1]
    if (!last || last[0] !== point[0] || last[1] !== point[1]) out.push(point)
  }
  if (out.length < 3) return null

  const [fx, fy] = out[0]
  if (out[out.length - 1][0] !== fx || out[out.length - 1][1] !== fy) out.push([fx, fy])
  return out.length < 4 ? null : out
}

function geometryOf(rings) {
  const polygons = []
  for (const polygon of toPolygons(rings)) {
    const tidied = polygon.map(tidy).filter(Boolean)
    if (tidied.length) polygons.push(tidied)
  }
  if (!polygons.length) return null

  return polygons.length === 1
    ? { type: 'Polygon', coordinates: polygons[0] }
    : { type: 'MultiPolygon', coordinates: polygons }
}

/** Every ring of a feature, flattened, whatever its geometry type. */
function ringsOf(geometry) {
  return geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat()
}

/**
 * Quantizes the state outlines, then rebuilds them from the result.
 *
 * Snapping coordinates to the quantization grid can flatten a thin sliver into a ring
 * of no width, so the rings are re-sorted afterwards and the collapsed ones dropped.
 * The second pass re-snaps coordinates that are already on the grid, so it changes
 * nothing beyond removing what the first pass broke.
 */
function quantize(features) {
  const first = topology({ states: { type: 'FeatureCollection', features } }, QUANTIZATION)

  const cleaned = toFeatures(first, first.objects.states).features
    .map((f) => {
      const geometry = geometryOf(ringsOf(f.geometry))
      return geometry && { type: 'Feature', properties: f.properties, geometry }
    })
    .filter(Boolean)

  return {
    topology: topology({ states: { type: 'FeatureCollection', features: cleaned } }, QUANTIZATION),
    features: cleaned,
  }
}

/* ---------------- dissolving districts into a state ---------------- */

/**
 * The outline of a state, from the districts that tile it.
 *
 * Districts cut from a shared topology meet on identical vertices, so an edge running
 * between two of them appears twice and an edge on the state's border appears once.
 * Keeping the singletons and stitching them back into closed rings leaves the outline,
 * coastal islands and all. The script checks this holds before relying on it.
 */
function dissolve(features) {
  const edges = new Map()

  for (const { geometry } of features) {
    for (const ring of ringsOf(geometry)) {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i]
        const b = ring[i + 1]
        const ka = key(a)
        const kb = key(b)
        if (ka === kb) continue

        const id = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
        const seen = edges.get(id)
        if (seen) seen.count++
        else edges.set(id, { a, b, count: 1 })
      }
    }
  }

  // More than two districts along one edge would mean the topology is not shared, and
  // the result would be silently wrong rather than obviously broken.
  for (const edge of edges.values()) {
    if (edge.count > 2) throw new Error('an edge is shared by more than two districts')
  }

  // Only the border edges, indexed by where each one starts. Direction is the
  // district's own winding, so the rings come out wound the same way.
  const outgoing = new Map()
  for (const { a, b, count } of edges.values()) {
    if (count !== 1) continue
    const from = outgoing.get(key(a))
    if (from) from.push(b)
    else outgoing.set(key(a), [b])
  }

  const rings = []
  for (const [start, ends] of outgoing) {
    while (ends.length) {
      const first = start.split(',').map(Number)
      const ring = [first]
      let point = ends.pop()

      // Walk edge to edge until the ring closes. A vertex where several border edges
      // meet — a pinch point between two islands — can be entered more than once, so
      // each departure is consumed as it is used.
      while (point) {
        ring.push(point)
        if (key(point) === start) break
        const next = outgoing.get(key(point))
        point = next?.length ? next.pop() : null
      }

      if (ring.length > 3 && key(ring[ring.length - 1]) === start) rings.push(ring)
    }
  }

  return rings
}

/* ---------------- run ---------------- */

const shp = resolve(process.cwd(), input)
const dbf = shp.replace(/\.shp$/i, '.dbf')
const prj = shp.replace(/\.shp$/i, '.prj')

try {
  const wkt = readFileSync(prj, 'utf8')
  if (!/GEOGCS/i.test(wkt)) {
    console.error(`${prj} is not a geographic CRS — reproject to WGS84 lon/lat first.`)
    process.exit(1)
  }
} catch {
  console.warn(`No .prj beside the shapefile — assuming WGS84 lon/lat.`)
}

const byState = new Map()
let congress = null
let skipped = []

const source = await shapefile.open(shp, dbf)
for (let read = await source.read(); !read.done; read = await source.read()) {
  const { properties, geometry } = read.value
  if (!geometry) continue

  const id = String(properties.id ?? '')
  const abbr = id.slice(0, 2)
  const district = id.slice(2)
  congress ??= properties.congress ? String(properties.congress) : null

  if (!VALID_ABBR.has(abbr) || !/^\d{2}$/.test(district)) {
    skipped.push(id || '(no id)')
    continue
  }

  const list = byState.get(abbr)
  if (list) list.push({ district, geometry })
  else byState.set(abbr, [{ district, geometry }])
}

if (!byState.size) {
  console.error(`No usable features in ${input} — is there an \`id\` property like "OH09"?`)
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })

const installed = []
const stateFeatures = []
const expectedArea = new Map()
const mismatched = []
let districtCount = 0

for (const [abbr, features] of [...byState].sort(([a], [b]) => a.localeCompare(b))) {
  let districtArea = 0

  // The District of Columbia elects a delegate, not a representative. Its single
  // "district" is the city, so it contributes a state outline but no district file —
  // otherwise the map would offer to zoom into a district that does not exist.
  const isDistrict = abbr !== 'DC'

  if (isDistrict) {
    const written = features
      .sort((a, b) => a.district.localeCompare(b.district))
      .map(({ district, geometry }) => {
        const built = geometryOf(ringsOf(geometry))
        return built && { type: 'Feature', properties: { district }, geometry: built }
      })
      .filter(Boolean)

    writeFileSync(
      resolve(OUT_DIR, `${abbr}.json`),
      JSON.stringify({ type: 'FeatureCollection', features: written }),
    )
    installed.push(abbr)
    districtCount += written.length
    districtArea = written.reduce((sum, f) => sum + geoArea(f), 0)
  }

  const outline = geometryOf(dissolve(features))
  if (!outline) continue

  stateFeatures.push({ type: 'Feature', properties: { abbr }, geometry: outline })
  expectedArea.set(abbr, districtArea)
}

const states = quantize(stateFeatures)

// Each outline is the union of the districts it was dissolved from, so the two must
// cover the same ground. This runs on the finished geometry, after quantization, because
// that is the step most likely to break it — and a ring left degenerate is not a rounding
// error but a rendering one: d3 reads it spherically and fills the entire map.
for (const f of states.features) {
  const expected = expectedArea.get(f.properties.abbr)
  if (!expected) continue
  const drift = Math.abs(geoArea(f) - expected) / expected
  if (drift > 0.001) mismatched.push(`${f.properties.abbr} ${(drift * 100).toFixed(1)}%`)
}

if (mismatched.length) {
  console.error(`Outline does not match the districts it covers: ${mismatched.join(', ')}`)
  process.exit(1)
}

writeFileSync(resolve(GEO_DIR, 'states.json'), JSON.stringify(states.topology))
writeFileSync(
  resolve(OUT_DIR, 'manifest.json'),
  `${JSON.stringify(
    { label: label ?? (congress ? `${congress}th Congress` : 'current district lines'), states: installed },
    null,
    2,
  )}\n`,
)

console.log(`${districtCount} districts across ${installed.length} states -> public/geo/districts/`)
console.log(`${states.features.length} state outlines -> public/geo/states.json`)
if (skipped.length) console.log(`skipped: ${skipped.join(', ')}`)
