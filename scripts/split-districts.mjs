#!/usr/bin/env node
/**
 * Splits a national congressional-district GeoJSON into one file per state and
 * regenerates the manifest the app reads.
 *
 *   npm run geo:districts -- cd119.json --label "119th Congress"
 *
 * Input must be a GeoJSON FeatureCollection in WGS84 whose features carry a state
 * FIPS property (`STATEFP`, `STATE`, `STATEFP20`, ...) or a `STUSPS`/`STATE_ABBR`
 * abbreviation. See public/geo/README.md for how to produce one from a Census
 * shapefile.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public/geo/districts')

const FIPS_TO_ABBR = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
  '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI',
  '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
  '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
  '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY',
}
const VALID_ABBR = new Set(Object.values(FIPS_TO_ABBR))

const STATE_FIPS_PROPS = ['STATEFP', 'STATEFP20', 'STATEFP24', 'STATE', 'STATE_FIPS', 'statefp']
const STATE_ABBR_PROPS = ['STUSPS', 'STATE_ABBR', 'state', 'ST']

/** Resolves a feature to a USPS abbreviation, or null if it is not a US state. */
function abbrOf(feature) {
  const props = feature.properties ?? {}

  for (const key of STATE_FIPS_PROPS) {
    const raw = props[key]
    if (raw === undefined || raw === null || raw === '') continue
    const abbr = FIPS_TO_ABBR[String(raw).padStart(2, '0')]
    if (abbr) return abbr
  }

  for (const key of STATE_ABBR_PROPS) {
    const raw = props[key]
    if (typeof raw !== 'string') continue
    const abbr = raw.trim().toUpperCase()
    if (VALID_ABBR.has(abbr)) return abbr
  }

  return null
}

function parseArgs(argv) {
  const positional = []
  let label = null

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--label') label = argv[++i]
    else positional.push(argv[i])
  }

  if (!positional.length) {
    console.error('usage: npm run geo:districts -- <national.geojson> [--label "119th Congress"]')
    process.exit(1)
  }
  return { input: positional[0], label: label ?? 'congressional districts' }
}

const { input, label } = parseArgs(process.argv.slice(2))

const geo = JSON.parse(readFileSync(resolve(process.cwd(), input), 'utf8'))
if (geo.type !== 'FeatureCollection' || !Array.isArray(geo.features)) {
  console.error(`${input}: expected a GeoJSON FeatureCollection`)
  process.exit(1)
}

const byState = new Map()
let skipped = 0

for (const feature of geo.features) {
  const abbr = abbrOf(feature)
  if (!abbr) {
    skipped++
    continue
  }
  if (!byState.has(abbr)) byState.set(abbr, [])
  byState.get(abbr).push(feature)
}

if (!byState.size) {
  console.error(
    `${input}: no features carried a recognisable state property.\n` +
      `Looked for ${[...STATE_FIPS_PROPS, ...STATE_ABBR_PROPS].join(', ')}.`,
  )
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })

const states = [...byState.keys()].sort()
let bytes = 0

for (const abbr of states) {
  const json = JSON.stringify({ type: 'FeatureCollection', features: byState.get(abbr) })
  writeFileSync(resolve(OUT_DIR, `${abbr}.json`), json)
  bytes += json.length
}

writeFileSync(
  resolve(OUT_DIR, 'manifest.json'),
  `${JSON.stringify({ label, states }, null, 2)}\n`,
)

const mb = (bytes / 1024 / 1024).toFixed(1)
console.log(`Wrote ${states.length} states (${mb} MB) to public/geo/districts/`)
console.log(`Manifest label: "${label}"`)
if (skipped) console.log(`Skipped ${skipped} features with no US state (territories?)`)
