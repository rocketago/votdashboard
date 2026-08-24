#!/usr/bin/env node
/**
 * Pulls the organizational data out of Airtable and writes it into `src/data/`.
 *
 *   npm run sync                                # refresh chapters and campuses
 *   npm run sync -- --inspect                   # what bases can this token see?
 *   npm run sync -- --inspect --base appXXX     # what tables and fields are in one?
 *   npm run sync -- --base appXXX --table T --summary   # field shape, contact data hidden
 *   npm run sync -- --base appXXX --table T --dump      # field names and one full record
 *
 * Two bases feed this. Chapters come from "VOT Chapters"; the campuses that will carry
 * fellows come from "VOT 2026 Soft Side Reports", where each campus links to the target
 * district it sits in and the district name gives the state.
 *
 * This runs at build time, never in the browser. The app is a static site with no
 * server, so anything it fetches at runtime would need the token in the bundle — and the
 * bundle is public. Airtable is read here, the result is committed as ordinary source,
 * and the token stays on the machine that ran the script.
 *
 * The token comes from AIRTABLE_TOKEN, in the environment or in a .env file at the repo
 * root (which .gitignore excludes). It needs `schema.bases:read` to inspect and
 * `data.records:read` to sync, granted to both bases. Base ids are identifiers, not
 * secrets, so they live below rather than in .env — only the token does.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://api.airtable.com/v0'

/** Where each thing is read from. Overridable by env, but these rarely move. */
const SOURCE = {
  chapters: {
    base: process.env['AIRTABLE_CHAPTERS_BASE'] ?? 'appZ6twX3pDmU8AMI',
    table: 'Chapter Management',
  },
  campuses: {
    base: process.env['AIRTABLE_REPORTS_BASE'] ?? 'appwnA2eTd4GfxZWE',
    table: 'Campuses',
    districts: 'Districts',
  },
  reports: {
    base: process.env['AIRTABLE_REPORTS_BASE'] ?? 'appwnA2eTd4GfxZWE',
    table: 'States',
  },
  events: {
    base: process.env['AIRTABLE_REPORTS_BASE'] ?? 'appwnA2eTd4GfxZWE',
    table: 'Event Tracker (Org-Wide)',
  },
  stories: {
    base: process.env['AIRTABLE_REPORTS_BASE'] ?? 'appwnA2eTd4GfxZWE',
    table: 'Fellow Reports',
  },
  targets: {
    base: process.env['AIRTABLE_REPORTS_BASE'] ?? 'appwnA2eTd4GfxZWE',
    states: 'States',
    districts: 'Districts',
  },
}

/* ---------------- token ---------------- */

/** Reads .env without adding a dependency. Only KEY=value lines, # for comments. */
function loadEnvFile() {
  const path = resolve(ROOT, '.env')
  if (!existsSync(path)) return

  const parsed = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
    if (!match) continue

    const value = match[2].replace(/^["']|["']$/g, '').trim()
    // An empty entry means unset, not "": .env starts as a copy of .env.example with
    // only some blanks filled in. A later line overrides an earlier one, as dotenv
    // does, so appending to the file works the way people expect.
    if (value) parsed[match[1]] = value
  }

  // The real environment still wins, so CI can override the file without editing it.
  for (const [k, v] of Object.entries(parsed)) process.env[k] ??= v
}

loadEnvFile()

const TOKEN = process.env['AIRTABLE_TOKEN']
if (!TOKEN) {
  console.error(
    'No AIRTABLE_TOKEN.\n\n' +
      'Create a personal access token at https://airtable.com/create/tokens with scopes\n' +
      '`schema.bases:read` and `data.records:read`, granted to your base only, then put it\n' +
      'in a .env file at the repo root:\n\n' +
      '  AIRTABLE_TOKEN=patXXXXXXXXXXXXXX.XXXXXXXX\n\n' +
      '.gitignore already excludes .env — keep it that way.',
  )
  process.exit(1)
}

/* ---------------- arguments ---------------- */

const args = process.argv.slice(2)
const has = (name) => args.includes(`--${name}`)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? null : args[i + 1]
}

// Exploration flags address a base and table explicitly; the sync itself uses SOURCE.
const baseId = flag('base') ?? process.env['AIRTABLE_BASE']
const tableName = flag('table') ?? process.env['AIRTABLE_TABLE']

/* ---------------- api ---------------- */

async function api(path, params) {
  const url = new URL(`${API}/${path}`)
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  }

  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const hint =
      res.status === 401
        ? ' — the token is wrong or revoked'
        : res.status === 403
          ? ' — the token lacks the scope, or was not granted access to this base'
          : res.status === 404
            ? ' — no such base or table, or the token cannot see it'
            : ''
    throw new Error(`Airtable ${res.status}${hint}\n${body.slice(0, 400)}`)
  }

  return res.json()
}

/** Every record in a table, following Airtable's 100-per-page cursor. */
async function allRecords(base, table) {
  const records = []
  let offset

  do {
    const page = await api(`${base}/${encodeURIComponent(table)}`, { pageSize: 100, offset })
    records.push(...page.records)
    offset = page.offset
  } while (offset)

  return records
}

/* ---------------- inspect ---------------- */

if (has('inspect')) {
  if (!baseId) {
    const { bases } = await api('meta/bases')
    console.log(`${bases.length} base(s) this token can see:\n`)
    for (const b of bases) console.log(`  ${b.id}  ${b.name}  (${b.permissionLevel})`)
    console.log('\nRe-run with --base <id> to list its tables and fields.')
    process.exit(0)
  }

  const { tables } = await api(`meta/bases/${baseId}/tables`)
  console.log(`${tables.length} table(s) in ${baseId}:\n`)

  for (const t of tables) {
    console.log(`  ${t.name}  (${t.id}) — ${t.fields.length} fields`)
    for (const f of t.fields) console.log(`      ${f.name}  ·  ${f.type}`)
    console.log()
  }
  process.exit(0)
}

/* ---------------- summary ---------------- */

/**
 * Fields holding personal data, which the summary reports as counts only.
 *
 * These tables are chapter intake forms as much as rosters: they carry organiser names,
 * emails, phone numbers and birthdates. A summary is something you paste into a chat or
 * a ticket to explain the shape of the data, so it should never carry the data itself.
 */
const SENSITIVE = /lead|e-?mail|phone|birth|address|parent|guardian|roster|zip/i
const SENSITIVE_TYPES = new Set(['email', 'phoneNumber', 'multipleAttachments'])

/* ---------------- dump ---------------- */

if (has('summary') || has('dump')) {
  if (!baseId || !tableName) {
    console.error('--summary and --dump need --base <appXXXX> --table <name>.')
    process.exit(1)
  }
}

const records =
  has('summary') || has('dump') ? await allRecords(baseId, tableName) : []
if (records.length) console.log(`${records.length} record(s) in "${tableName}"`)

if (has('summary')) {
  const fields = new Map()
  for (const r of records) {
    for (const [k, v] of Object.entries(r.fields)) {
      if (!fields.has(k)) fields.set(k, [])
      fields.get(k).push(v)
    }
  }

  console.log()
  for (const [name, values] of fields) {
    const distinct = new Set(values.map((v) => JSON.stringify(v)))
    const hidden = SENSITIVE.test(name)
    const head = `  ${name}  ·  ${values.length}/${records.length} populated  ·  ${distinct.size} distinct`

    if (hidden) {
      console.log(`${head}  ·  [redacted]`)
      continue
    }

    // Low-cardinality fields are categories: list them all, they are what the mapping
    // has to switch on. High-cardinality ones only need a couple of examples.
    const shown = [...distinct].slice(0, distinct.size <= 12 ? 12 : 3)
    console.log(`${head}\n      ${shown.join('\n      ')}${distinct.size > shown.length ? `\n      … ${distinct.size - shown.length} more` : ''}`)
  }
  process.exit(0)
}

if (has('dump')) {
  // Field names as they actually come back, with an example value for each — enough to
  // write the mapping against without guessing at the schema.
  const seen = new Map()
  for (const r of records) {
    for (const [k, v] of Object.entries(r.fields)) {
      if (!seen.has(k)) seen.set(k, { count: 0, example: v })
      seen.get(k).count++
    }
  }

  console.log(`\n${seen.size} field(s) in use:\n`)
  for (const [name, { count, example }] of seen) {
    const shown = JSON.stringify(example)
    console.log(
      `  ${name}  ·  ${count}/${records.length} populated  ·  e.g. ` +
        `${shown.length > 70 ? `${shown.slice(0, 70)}…` : shown}`,
    )
  }

  console.log('\nFirst record in full:\n')
  console.log(JSON.stringify(records[0]?.fields ?? {}, null, 2))
  process.exit(0)
}

/* ---------------- shared ---------------- */

const HEADER = (source, note) => `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`scripts/sync-airtable.mjs\` from ${source}.
 * Re-run \`npm run sync\` to refresh it.
 *
${note}
 */
`

/** Writes a generated module, reporting whether anything actually moved. */
function emit(file, contents, summary) {
  const path = resolve(ROOT, 'src/data', file)
  const before = existsSync(path) ? readFileSync(path, 'utf8') : null
  writeFileSync(path, contents)
  console.log(`${summary} -> src/data/${file}${before === contents ? ' (unchanged)' : ''}`)
}

/* ---------------- chapters ---------------- */

/**
 * Airtable stores the location as a full state name. Both "DC" and "District of
 * Columbia" are in use for the same place, and at least one value carries a trailing
 * space, so names are trimmed before lookup.
 */
const NAME_TO_ABBR = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI',
  Wyoming: 'WY', 'District of Columbia': 'DC', DC: 'DC',
}

/** Airtable's `Chapter Type`. Only colleges are filed as Campus. */
const KIND = { Campus: 'campus', Community: 'community' }

/** Airtable's `Campus Type` — what the chapter is attached to. */
const SETTING = {
  College: 'college',
  'High School': 'high-school',
  Community: 'community',
  State: 'state',
}

/**
 * The area a community chapter covers: midpoint, then a radius in degrees of latitude.
 *
 * A community chapter is drawn as a circle over its whole area rather than a pin, so it
 * needs an extent as well as a centre. Both come from the place's bounding box,
 * geocoded once against OpenStreetMap and recorded here rather than looked up on every
 * sync: the values do not move, and a build should not depend on a third-party service
 * being up. A chapter without an entry stops the sync rather than going unplaced.
 *
 * The two regions are a judgement call, not a lookup. "Central Florida" and "Northern
 * Virginia" are not places a geocoder knows — asked directly, it returns a sugar mill in
 * Cuba and a town in the Northern Territory — so they are anchored on the population
 * centre each name is understood to mean.
 */
const COMMUNITY_PLACE = {
  'Los Angeles': [33.9984, -118.4117, 0.339],
  'San Francisco': [37.785, -122.7276, 0.353],
  Atlanta: [33.7674, -84.4202, 0.12],
  Boston: [42.3124, -70.9979, 0.143],
  Raleigh: [35.8395, -78.6449, 0.141],
  'New York City': [40.6971, -73.9795, 0.221],
  Cleveland: [41.4975, -81.7059, 0.13],
  Seattle: [47.6076, -122.3421, 0.127],
  /** Orlando and a radius over the metro: the region has no boundary to measure. */
  'Central Florida': [28.5421, -81.379, 0.85],
  /** Fairfax County, with a radius over the NoVA suburbs. Also unmeasurable. */
  'Northern Virginia': [38.8156, -77.2837, 0.35],
}

/**
 * Campus ZIPs, geocoded once against OpenStreetMap and recorded here for the same reason
 * as the cities above: the values do not move, and a build should not reach out to a
 * third party. Every one was checked to land in the state Airtable files it under.
 *
 * `npm run sync -- --geocode-zips` prints entries for any ZIP in Airtable that is
 * missing from this table.
 */
const ZIP_PLACE = {
  '01002': [42.3832, -72.5199],
  '16802': [40.8015, -77.8615],
  '20052': [38.9101, -77.0286],
  '23668': [37.0218, -76.3366],
  '23875': [37.2359, -77.285],
  '32801': [28.5433, -81.3768],
  '30303': [33.7539, -84.3898],
  '30332': [33.7747, -84.3947],
  '32789': [28.5989, -81.3497],
  '32816': [28.6023, -81.1995],
  '33146': [25.7207, -80.2722],
  '33431': [26.3764, -80.1039],
  '33606': [27.9366, -82.4674],
  '33620': [28.0628, -82.4137],
  '34243': [27.4031, -82.5221],
  '47405': [39.1681, -86.5194],
  '90024': [34.0614, -118.4439],
  '90650': [33.9063, -118.0886],
  '94720': [37.8732, -122.2571],
}

async function syncChapters() {
  const rows = await allRecords(SOURCE.chapters.base, SOURCE.chapters.table)
  const chapters = []
  const problems = []

  for (const record of rows) {
    const f = record.fields
    const name = String(f['Name'] ?? '').trim()
    const rawState = String(f['State or Territory'] ?? '').trim()
    const abbr = NAME_TO_ABBR[rawState]
    const kind = KIND[String(f['Chapter Type'] ?? '').trim()]
    const setting = SETTING[String(f['Campus Type'] ?? '').trim()]
    const zip = String(f['Campus Zip'] ?? '').trim()

    if (!name) problems.push(`${record.id}: no Name`)
    else if (!abbr) problems.push(`${name}: unrecognised State or Territory "${rawState}"`)
    else if (!kind) problems.push(`${name}: unrecognised Chapter Type "${f['Chapter Type']}"`)
    else if (!setting) problems.push(`${name}: unrecognised Campus Type "${f['Campus Type']}"`)
    else chapters.push({ name, state: abbr, kind, setting, zip })
  }

  // Where a chapter is drawn. A ZIP is the most precise thing Airtable holds and wins
  // wherever there is one; a named city is the fallback for a community chapter without.
  // A chapter with neither is listed rather than drawn, which is where the high schools
  // stand. A ZIP we cannot resolve is a gap to close, not something to draw around.
  for (const chapter of chapters) {
    // A statewide chapter covers the state the map is already showing, so it is listed
    // rather than marked — a dot at the centroid pointed at nothing in particular.
    if (chapter.setting === 'state') continue

    // A community chapter is drawn as its area, so the named place wins over its ZIP:
    // Central Florida's ZIP is a downtown block, not the region the chapter covers.
    if (chapter.setting === 'community') {
      const at = COMMUNITY_PLACE[chapter.name]
      if (at) {
        chapter.at = [at[0], at[1]]
        chapter.radius = at[2]
      } else problems.push(`${chapter.name}: no entry in COMMUNITY_PLACE`)
      continue
    }

    if (chapter.zip) {
      const at = ZIP_PLACE[chapter.zip]
      if (at) chapter.at = at
      else
        problems.push(
          `${chapter.name}: ZIP ${chapter.zip} is not in ZIP_PLACE — run npm run sync -- --geocode-zips`,
        )
      continue
    }
  }

  if (problems.length) fail('chapters', problems)

  chapters.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name))

  const rowsOut = chapters
    .map(
      (c) =>
        `  { name: ${JSON.stringify(c.name)}, state: '${c.state}', ` +
        `kind: '${c.kind}', setting: '${c.setting}'` +
        `${c.at ? `, lat: ${c.at[0]}, lon: ${c.at[1]}` : ''}` +
        `${c.radius ? `, radius: ${c.radius}` : ''} },`,
    )
    .join('\n')

  emit(
    'chapters.ts',
    HEADER(
      'the "Chapter Management" table in the VOT Chapters base',
      ` * This is the real chapter roster, unlike most of \`src/data/\`. Chapter status and
 * counts in \`states.ts\` are derived from it rather than hand-set.
 *
 * Airtable carries no latitude or longitude. Chapters are placed anyway: a community one
 * over the city or region it covers, and a campus at
 * its ZIP. A chapter with no position is listed rather than drawn.`,
    ) +
      `
/** Airtable's \`Chapter Type\`. Only colleges are filed as Campus. */
export type ChapterKind = 'campus' | 'community'

/** Airtable's \`Campus Type\` — what the chapter is attached to. */
export type ChapterSetting = 'college' | 'high-school' | 'community' | 'state'

export interface Chapter {
  name: string
  /** USPS abbreviation of the state the chapter is in. */
  state: string
  kind: ChapterKind
  setting: ChapterSetting
  /**
   * Where to draw it, when that is known. A statewide chapter sits at the centre of its
   * state and a community chapter at the centre of its city; schools have no coordinates
   * yet, and are listed rather than mapped.
   */
  lat?: number
  lon?: number
  /**
   * Radius in degrees of latitude, on a community chapter only. It covers a city or a
   * region rather than sitting at a point, so it is drawn as that area.
   */
  radius?: number
}

export const CHAPTERS: Chapter[] = [
${rowsOut}
]

const BY_STATE = CHAPTERS.reduce<Record<string, Chapter[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

/** Every chapter in a state, alphabetically. Empty where there are none. */
export const chaptersIn = (abbr: string): Chapter[] => BY_STATE[abbr] ?? []

/** A chapter that can be drawn on a map. */
export type PlacedChapter = Chapter & { lat: number; lon: number }

const isPlaced = (c: Chapter): c is PlacedChapter =>
  c.lat !== undefined && c.lon !== undefined

/** Chapters in a state that carry a position. Schools do not, yet. */
export const placedChaptersIn = (abbr: string): PlacedChapter[] =>
  chaptersIn(abbr).filter(isPlaced)

/** How a chapter's setting reads in the UI. */
export const SETTING_LABEL: Record<ChapterSetting, string> = {
  college: 'college',
  'high-school': 'high school',
  community: 'community',
  state: 'statewide',
}
`,
    `${chapters.length} chapters across ${new Set(chapters.map((c) => c.state)).size} states`,
  )
}

/* ---------------- campuses ---------------- */

/**
 * Where each fellowship campus sits.
 *
 * Airtable records a campus by name alone, so these are geocoded against OpenStreetMap
 * and recorded here, as the chapter ZIPs are. Every one was checked to fall inside the
 * district Airtable links it to, using the boundaries in public/geo — which is a
 * stronger check than the state, and the reason two errors did not ship:
 *
 *   - "Lynchburg University" resolved to Virginia University of Lynchburg, a different
 *     institution three kilometres away. It is the University of Lynchburg, formerly
 *     Lynchburg College.
 *   - "Saint Ambrose University" did not resolve at all until spelled St Ambrose.
 *
 * A campus with no entry is listed but not drawn, rather than stopping the sync: the
 * fellowship list will grow, and a missing pin should not block a build.
 */
const CAMPUS_PLACE = {
  'Grand View University': [41.6198, -93.5988],
  'Drake University': [41.6031, -93.6553],
  'Saint Ambrose University': [41.5398, -90.5812],
  'University of Iowa': [41.6311, -91.5408],
  'Longwood University': [37.309, -78.4017],
  'University of Virginia': [38.0411, -78.5055],
  'Liberty University': [37.3539, -79.1532],
  'Virginia University of Lynchburg': [37.3951, -79.1528],
  'Lynchburg University': [37.3987, -79.184],
  'Randolph College': [37.4393, -79.1709],
}

async function syncCampuses() {
  const { base, table, districts: districtTable } = SOURCE.campuses
  const [rows, districtRows] = await Promise.all([
    allRecords(base, table),
    allRecords(base, districtTable),
  ])

  // Airtable writes Alaska's at-large seat as AK-AL; the rest of the app uses AK-00,
  // matching the two-digit district numbers in the map geometry.
  const districtName = new Map(
    districtRows.map((d) => [
      d.id,
      String(d.fields['District Name'] ?? '').trim().replace(/-AL$/, '-00'),
    ]),
  )

  const campuses = []
  const problems = []

  for (const record of rows) {
    const name = String(record.fields['Campus'] ?? '').trim()
    const links = record.fields['Districts'] ?? []
    const district = districtName.get(links[0])

    if (!name) problems.push(`${record.id}: no Campus name`)
    else if (!links.length) problems.push(`${name}: not linked to a district`)
    else if (!district) problems.push(`${name}: district link resolves to nothing`)
    else if (!/^[A-Z]{2}-\d{2}$/.test(district))
      problems.push(`${name}: district "${district}" is not a two-letter state and number`)
    else campuses.push({ name, district, state: district.slice(0, 2), at: CAMPUS_PLACE[name] })
  }

  if (problems.length) fail('campuses', problems)

  campuses.sort((a, b) => a.district.localeCompare(b.district) || a.name.localeCompare(b.name))

  const rowsOut = campuses
    .map(
      (c) =>
        `  { name: ${JSON.stringify(c.name)}, state: '${c.state}', ` +
        `district: '${c.district}'` +
        `${c.at ? `, lat: ${c.at[0]}, lon: ${c.at[1]}` : ''} },`,
    )
    .join('\n')

  emit(
    'campuses.ts',
    HEADER(
      'the "Campuses" table in the VOT 2026 Soft Side Reports base',
      ` * The campuses that will carry fellows. Each is linked to a target district in
 * Airtable, and the district name is where the state comes from — the table itself has
 * no state column.
 *
 * Airtable records a campus by name only, so coordinates are geocoded in the sync script
 * rather than stored here. A campus it has no entry for is listed but not drawn.`,
    ) +
      `
import { STATES } from './states'
import type { TargetType } from './tiers'

export interface Campus {
  name: string
  /** USPS abbreviation, taken from the district the campus is linked to. */
  state: string
  /** Target district the campus sits in, e.g. \`'VA-05'\`. */
  district: string
  /** Approximate campus centroid. Absent until Airtable carries coordinates. */
  lat?: number
  lon?: number
  /**
   * Radius in degrees of latitude, on a community chapter only. It covers a city or a
   * region rather than sitting at a point, so it is drawn as that area.
   */
  radius?: number
}

export const CAMPUSES: Campus[] = [
${rowsOut}
]

/**
 * A campus dot takes its state's dominant target type, so campus colouring can never
 * drift out of step with the board the way a hand-assigned tier would.
 */
export function campusType(campus: Campus): TargetType {
  return STATES[campus.state]?.tier ?? 'dev'
}

/** A campus with coordinates — the only kind the map can place. */
export type MappedCampus = Campus & { lat: number; lon: number }

const hasCoords = (c: Campus): c is MappedCampus =>
  c.lat !== undefined && c.lon !== undefined

/** Campuses that can actually be drawn. Empty until Airtable carries coordinates. */
export const MAPPABLE_CAMPUSES: MappedCampus[] = CAMPUSES.filter(hasCoords)

const BY_STATE = CAMPUSES.reduce<Record<string, Campus[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

export const campusesIn = (abbr: string): Campus[] => BY_STATE[abbr] ?? []

/** Campuses in a state that can be drawn, as opposed to merely listed. */
export const mappableCampusesIn = (abbr: string): MappedCampus[] =>
  campusesIn(abbr).filter(hasCoords)
`,
    `${campuses.length} campuses across ${new Set(campuses.map((c) => c.district)).size} districts` +
      `, ${campuses.filter((c) => c.at).length} placed`,
  )
}

/* ---------------- reported totals ---------------- */

/**
 * What each state has actually reported, rolled up in Airtable from the chapter and
 * fellow report tables. `Total Voter Reg` and friends are formulas summing the chapter
 * and fellow halves, so this reads the totals rather than re-adding them here.
 */
async function syncReports() {
  const rows = await allRecords(SOURCE.reports.base, SOURCE.reports.table)
  const reports = []
  const problems = []

  const number = (v) => (typeof v === 'number' ? v : Number(v ?? 0) || 0)

  for (const record of rows) {
    const rawState = String(record.fields['State'] ?? '').trim()
    const abbr = NAME_TO_ABBR[rawState]

    if (!rawState) problems.push(`${record.id}: no State`)
    else if (!abbr) problems.push(`unrecognised State "${rawState}"`)
    else
      reports.push({
        abbr,
        reg: number(record.fields['Total Voter Reg']),
        pledge: number(record.fields['Total Pledges']),
        students: number(record.fields['Total Students Engaged']),
      })
  }

  if (problems.length) fail('state report', problems)

  reports.sort((a, b) => a.abbr.localeCompare(b.abbr))

  const rowsOut = reports
    .map(
      (r) =>
        `  ${r.abbr}: { reg: ${r.reg}, pledge: ${r.pledge}, students: ${r.students} },`,
    )
    .join('\n')

  const reported = reports.filter((r) => r.reg || r.pledge || r.students).length

  emit(
    'reports.ts',
    HEADER(
      'the "States" table in the VOT 2026 Soft Side Reports base',
      ` * Measured programme numbers, replacing what used to be generated. Airtable rolls
 * these up from the chapter and fellow report tables, so they move as reports land
 * rather than when this file is edited.
 *
 * A state absent here reports zero — it is not on the reporting board yet, which is not
 * the same as having done nothing. Goals are still placeholders; Airtable holds no
 * targets to compare these against.`,
    ) +
      `
export interface StateReport {
  /** Voter registration forms collected. */
  reg: number
  /** Pledges to vote collected. */
  pledge: number
  /** Students engaged. */
  students: number
}

export const REPORTS: Record<string, StateReport> = {
${rowsOut}
}

const NOTHING: StateReport = { reg: 0, pledge: 0, students: 0 }

/** Reported totals for a state, zeroed where the state does not report yet. */
export const reportFor = (abbr: string): StateReport => REPORTS[abbr] ?? NOTHING
`,
    `${reports.length} states reporting (${reported} with a non-zero total)`,
  )
}

/* ---------------- geocoding helper ---------------- */

/**
 * Prints ZIP_PLACE entries for any campus ZIP the table does not cover.
 *
 * Separate from the sync on purpose. Geocoding is a one-off for each new campus, and a
 * build that reaches out to a third party fails on their outage rather than ours — so
 * the values are pasted in and committed, not fetched.
 *
 * Each result is checked against the state Airtable files the chapter under, because a
 * geocoder answers even when it should not: asked for "Northern Virginia" it returns a
 * town in the Northern Territory.
 */
async function geocodeZips() {
  const rows = await allRecords(SOURCE.chapters.base, SOURCE.chapters.table)
  const missing = []

  for (const record of rows) {
    const zip = String(record.fields['Campus Zip'] ?? '').trim()
    if (!zip || ZIP_PLACE[zip]) continue
    missing.push({
      zip,
      name: String(record.fields['Name'] ?? '').trim(),
      state: String(record.fields['State or Territory'] ?? '').trim(),
    })
  }

  if (!missing.length) {
    console.log('Every campus ZIP in Airtable is already in ZIP_PLACE.')
    return
  }

  console.log(`${missing.length} ZIP(s) to add:\n`)

  for (const [i, m] of missing.entries()) {
    // Nominatim asks for no more than one request a second.
    if (i) await new Promise((r) => setTimeout(r, 1200))

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('postalcode', m.zip)
    url.searchParams.set('country', 'us')
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('addressdetails', '1')

    const res = await fetch(url, { headers: { 'User-Agent': 'votdashboard-setup/1.0' } })
    const hit = (await res.json())[0]

    if (!hit) {
      console.log(`  // ${m.name}: ZIP ${m.zip} did not resolve`)
      continue
    }

    const got = hit.address?.state ?? ''
    const agrees = got.toLowerCase() === m.state.toLowerCase()
    const line = `  '${m.zip}': [${(+hit.lat).toFixed(4)}, ${(+hit.lon).toFixed(4)}],`
    console.log(
      agrees
        ? `${line}  // ${m.name}, ${got}`
        : `${line}  // *** ${m.name}: Airtable says ${m.state}, this ZIP is in ${got} ***`,
    )
  }
}

/* ---------------- the target board ---------------- */

/** Airtable's `Target Type` choices. */
const TARGET_TYPE = {
  'Soft Target': 'soft',
  'Hard Target': 'hard',
  'Development Target': 'dev',
  'Secondary Development': 'sdev',
}

const TARGET_ORDER = ['soft', 'hard', 'dev', 'sdev']

/**
 * The board, from the Target Type column on States and Districts.
 *
 * A district row is a race in its own right. A state row is a statewide designation —
 * Airtable has no column distinguishing a Senate race from a statewide programme, so
 * both read as statewide here.
 */
async function syncTargets() {
  const { base, states: statesTable, districts: districtsTable } = SOURCE.targets
  const [stateRows, districtRows] = await Promise.all([
    allRecords(base, statesTable),
    allRecords(base, districtsTable),
  ])

  const byType = Object.fromEntries(TARGET_ORDER.map((t) => [t, []]))
  const problems = []

  const assign = (id, raw) => {
    for (const choice of raw) {
      const type = TARGET_TYPE[String(choice).trim()]
      if (!type) problems.push(`${id}: unrecognised Target Type "${choice}"`)
      else if (!byType[type].includes(id)) byType[type].push(id)
    }
  }

  for (const record of stateRows) {
    const raw = record.fields['Target Type'] ?? []
    if (!raw.length) continue

    const name = String(record.fields['State'] ?? '').trim()
    const abbr = NAME_TO_ABBR[name]
    if (!abbr) problems.push(`unrecognised State "${name}"`)
    else assign(abbr, raw)
  }

  for (const record of districtRows) {
    const raw = record.fields['Target Type'] ?? []
    if (!raw.length) continue

    // Airtable writes Alaska's at-large seat AK-AL; the app uses AK-00 throughout.
    const id = String(record.fields['District Name'] ?? '').trim().replace(/-AL$/, '-00')
    if (!/^[A-Z]{2}-\d{2}$/.test(id)) problems.push(`district "${id}" is not a state and number`)
    else assign(id, raw)
  }

  if (problems.length) fail('target', problems)

  const total = new Set(Object.values(byType).flat())
  if (!total.size) fail('target', ['no row in States or Districts carries a Target Type'])

  const list = (name, ids) =>
    `export const ${name}: string[] = [\n${[...ids]
      .sort()
      .map((id) => `  '${id}',`)
      .join('\n')}\n]`

  emit(
    'targets.data.ts',
    HEADER(
      'the Target Type columns on the States and Districts tables',
      ` * The board. A district row is a race; a state row is a statewide designation.
 *
 * Airtable has no column separating a Senate race from a statewide programme, so a
 * targeted state reads as "OH statewide" rather than "OH-Sen". Adding that distinction
 * means a column here, not a change in the app.`,
    ) +
      `
${list('SOFT_TARGETS', byType.soft)}

${list('HARD_TARGETS', byType.hard)}

${list('DEVELOPMENT_TARGETS', byType.dev)}

${list('SECONDARY_DEVELOPMENT_TARGETS', byType.sdev)}
`,
    `${total.size} targets (${TARGET_ORDER.map((t) => `${byType[t].length} ${t}`).join(', ')})`,
  )
}

/* ---------------- events ---------------- */

/** Airtable's `Event Type` choices, which match the app's programme types exactly. */
const EVENT_TYPE = {
  'Hard In-Person': 'hip',
  'Hard Distributed': 'hd',
  'Soft In-Person': 'sip',
  'Soft Distributed': 'sd',
}

/**
 * The calendar day an event falls on, in Eastern time.
 *
 * Airtable returns the instant in UTC, and the column is Eastern — so an evening event
 * would otherwise land on the following day. en-CA formats as YYYY-MM-DD.
 */
const EASTERN_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * The start time, Eastern, e.g. "6:00 PM".
 *
 * Converted here rather than in the browser, so what ships is already Eastern and a
 * viewer's own timezone cannot shift it. The dashboard is read across the country and a
 * 6pm event has one start time, not one per reader.
 */
const EASTERN_TIME = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric',
  minute: '2-digit',
})

/**
 * The state a targeted race belongs to. `Targeted Race` mixes district ids with plain
 * state names — "OH-09" and "Ohio" are both valid choices — and Alaska's at-large seat
 * is written AK-AL.
 */
function stateOfRace(race) {
  const text = String(race ?? '').trim()
  const prefixed = text.match(/^([A-Z]{2})-/)
  return prefixed ? prefixed[1] : (NAME_TO_ABBR[text] ?? null)
}

async function syncEvents() {
  const rows = await allRecords(SOURCE.events.base, SOURCE.events.table)
  const events = []
  const problems = []

  for (const record of rows) {
    const f = record.fields

    // Airtable omits empty fields, so a blank row arrives as {}. Those are placeholders
    // someone left in the table, not events, and are skipped rather than failed over.
    if (!Object.keys(f).length) continue

    const title = String(f['Event Name'] ?? '').trim()
    const type = EVENT_TYPE[String(f['Event Type'] ?? '').trim()]
    const when = f['Date and Time (ET)']
    const races = f['Targeted Race'] ?? []
    const states = [...new Set(races.map(stateOfRace).filter(Boolean))]

    if (!title) problems.push(`${record.id}: no Event Name`)
    else if (!when) problems.push(`${title}: no Date and Time`)
    else if (!type) problems.push(`${title}: unrecognised Event Type "${f['Event Type']}"`)
    else if (!races.length) problems.push(`${title}: no Targeted Race, so no state to file it under`)
    else if (!states.length)
      problems.push(`${title}: Targeted Race ${JSON.stringify(races)} names no state`)
    else {
      const instant = new Date(when)
      const date = EASTERN_DAY.format(instant)
      const time = EASTERN_TIME.format(instant)
      const meta = String(f['Location'] ?? '').trim()
      // An event targeting races in several states is listed in each, so it shows up
      // for every organiser it concerns.
      for (const state of states) events.push({ date, time, state, title, meta, type })
    }
  }

  if (problems.length) fail('event', problems)

  events.sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.state.localeCompare(b.state) || a.title.localeCompare(b.title),
  )

  const rowsOut = events
    .map(
      (e) =>
        `  { date: '${e.date}', time: ${JSON.stringify(e.time)}, state: '${e.state}', ` +
        `title: ${JSON.stringify(e.title)}, meta: ${JSON.stringify(e.meta)}, type: '${e.type}' },`,
    )
    .join('\n')

  const blank = rows.length - new Set(events.map((e) => `${e.date}${e.title}`)).size

  emit(
    'events.data.ts',
    HEADER(
      'the "Event Tracker (Org-Wide)" table in the VOT 2026 Soft Side Reports base',
      ` * Only the event rows live here; the calendar's types and date helpers are
 * hand-written in \`events.ts\`, which re-exports this list.
 *
 * An event targeting races in more than one state appears once per state, so it reaches
 * every organiser it concerns.
 *
 * Dates and times are Eastern, converted at sync time so nothing depends on the
 * reader's timezone.`,
    ) +
      `
import type { ProgramEvent } from './events'

export const EVENTS: ProgramEvent[] = [${rowsOut ? `\n${rowsOut}\n` : ''}]
`,
    `${events.length} events${blank > 0 ? ` (${rows.length} rows, ${rows.length - events.length} blank or multi-state)` : ''}`,
  )
}

/* ---------------- fellow report stories ---------------- */

async function syncStories() {
  const { base, table } = SOURCE.stories
  const [rows, stateRows] = await Promise.all([
    allRecords(base, table),
    allRecords(base, SOURCE.reports.table),
  ])

  // Build a map from Airtable state record id → USPS abbreviation, same join pattern
  // as syncCampuses() uses for Districts.
  const stateAbbr = new Map(
    stateRows.map((s) => [
      s.id,
      NAME_TO_ABBR[String(s.fields['State'] ?? '').trim()] ?? null,
    ]),
  )

  const stories = []
  const problems = []

  for (const record of rows) {
    const f = record.fields

    // Airtable omits empty fields, so a blank row arrives as {}. The Fellow Reports
    // table currently has one such placeholder row — skip it rather than failing.
    if (!Object.keys(f).length) continue

    const name = String(f['Name'] ?? '').trim()
    const quote = String(f["What's one conversation with a voter that stood out this week?"] ?? '').trim()
    const location = String(f['Where did this happen?'] ?? '').trim()
    const stateLinks = f['Your State'] ?? []
    const abbr = stateLinks.length ? stateAbbr.get(stateLinks[0]) : null

    if (!name) problems.push(`${record.id}: no Name`)
    else if (!quote) problems.push(`${name}: no quote`)
    else if (!location) problems.push(`${name}: no location`)
    else if (!stateLinks.length) problems.push(`${name}: no Your State link`)
    else if (!abbr) problems.push(`${name}: Your State link does not resolve to a known state`)
    else stories.push({ name, quote, location, state: abbr })
  }

  if (problems.length) fail('story', problems)

  stories.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name))

  const rowsOut = stories
    .map(
      (s) =>
        `  { name: ${JSON.stringify(s.name)}, quote: ${JSON.stringify(s.quote)}, ` +
        `location: ${JSON.stringify(s.location)}, ` +
        `scopes: [{ state: '${s.state}', districts: [] }], category: 'fellow_report' },`,
    )
    .join('\n')

  emit(
    'stories.data.ts',
    HEADER(
      'the "Fellow Reports" table in the VOT 2026 Soft Side Reports base',
      ` * Real fellow-report stories, sourced from the Fellow Reports form. Every story
 * sourced from this form gets \`category: 'fellow_report'\` — the form does not
 * ask about the fellow's role, so no finer category is assigned.
 *
 * Placeholder sample stories (volunteer, voter, campus, organizer) live in
 * \`stories.sample.ts\` and are merged in by \`stories.ts\` alongside this list.`,
    ) +
      `
import type { Story } from './stories'

export const STORIES: Story[] = [${rowsOut ? `\n${rowsOut}\n` : ''}]
`,
    `${stories.length} fellow report stories`,
  )
}

/**
 * A row that cannot be mapped would be dropped from a list the dashboard presents as
 * complete, so it is worth stopping over rather than quietly shipping a short one.
 */
function fail(what, problems) {
  console.error(`\n${problems.length} ${what} record(s) could not be mapped:\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error('\nFix them in Airtable, or extend the tables in this script.')
  process.exit(1)
}

if (has('geocode-zips')) {
  await geocodeZips()
  process.exit(0)
}

await syncChapters()
await syncCampuses()
await syncTargets()
await syncReports()
await syncEvents()
await syncStories()
