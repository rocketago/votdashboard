#!/usr/bin/env node
/**
 * Pulls the chapter list out of Airtable and writes it into `src/data/`.
 *
 *   npm run chapters -- --inspect                 # what bases can this token see?
 *   npm run chapters -- --inspect --base appXXX   # what tables and fields are in one?
 *   npm run chapters -- --base appXXX --table Chapters --dump
 *
 * This runs at build time, never in the browser. The app is a static site with no
 * server, so anything it fetches at runtime would need the token in the bundle — and the
 * bundle is public. Airtable is read here, the result is committed as ordinary source,
 * and the token stays on the machine that ran the script.
 *
 * The token comes from AIRTABLE_TOKEN, in the environment or in a .env file at the repo
 * root (which .gitignore excludes). It needs `schema.bases:read` to inspect and
 * `data.records:read` to sync, scoped to the one base.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://api.airtable.com/v0'

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

const baseId = flag('base') ?? process.env['AIRTABLE_BASE']
const tableName = flag('table') ?? process.env['AIRTABLE_TABLE'] ?? 'Chapters'

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

if (!baseId) {
  console.error('Pass --base <appXXXX> (or set AIRTABLE_BASE). Run with --inspect to find it.')
  process.exit(1)
}

const records = await allRecords(baseId, tableName)
console.log(`${records.length} record(s) in "${tableName}"`)

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

/* ---------------- mapping ---------------- */

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

const chapters = []
const problems = []

for (const record of records) {
  const f = record.fields
  const name = String(f['Name'] ?? '').trim()
  const rawState = String(f['State or Territory'] ?? '').trim()
  const abbr = NAME_TO_ABBR[rawState]
  const kind = KIND[String(f['Chapter Type'] ?? '').trim()]
  const setting = SETTING[String(f['Campus Type'] ?? '').trim()]

  if (!name) problems.push(`${record.id}: no Name`)
  else if (!abbr) problems.push(`${name}: unrecognised State or Territory "${rawState}"`)
  else if (!kind) problems.push(`${name}: unrecognised Chapter Type "${f['Chapter Type']}"`)
  else if (!setting) problems.push(`${name}: unrecognised Campus Type "${f['Campus Type']}"`)
  else chapters.push({ name, state: abbr, kind, setting })
}

// A row that cannot be mapped is dropped from a roster the dashboard presents as
// complete, so it is worth stopping over rather than quietly shipping a short list.
if (problems.length) {
  console.error(`\n${problems.length} record(s) could not be mapped:\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error('\nFix them in Airtable, or extend the tables in this script.')
  process.exit(1)
}

chapters.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name))

const byState = new Map()
for (const c of chapters) byState.set(c.state, (byState.get(c.state) ?? 0) + 1)

const rows = chapters
  .map(
    (c) =>
      `  { name: ${JSON.stringify(c.name)}, state: '${c.state}', ` +
      `kind: '${c.kind}', setting: '${c.setting}' },`,
  )
  .join('\n')

// No timestamp in the header: re-running with unchanged data should produce an
// identical file, so the diff shows what actually moved rather than that it ran.
const out = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`scripts/sync-chapters.mjs\` from the "Chapter Management" table in the
 * VOT Chapters Airtable base. Re-run \`npm run chapters\` to refresh it.
 *
 * This is the real chapter roster, unlike most of \`src/data/\`. Chapter status and
 * counts in \`states.ts\` are derived from it rather than hand-set.
 *
 * Airtable carries no coordinates for these — \`Campus Zip\` is populated on a handful
 * of records — so chapters are listed, not mapped. The campus pins on the map still
 * come from the placeholder list in \`campuses.ts\`.
 */

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
}

export const CHAPTERS: Chapter[] = [
${rows}
]

const BY_STATE = CHAPTERS.reduce<Record<string, Chapter[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c)
  return acc
}, {})

/** Every chapter in a state, alphabetically. Empty where there are none. */
export const chaptersIn = (abbr: string): Chapter[] => BY_STATE[abbr] ?? []

/** How a chapter's setting reads in the UI. */
export const SETTING_LABEL: Record<ChapterSetting, string> = {
  college: 'college',
  'high-school': 'high school',
  community: 'community',
  state: 'statewide',
}
`

writeFileSync(resolve(ROOT, 'src/data/chapters.ts'), out)

console.log(`${chapters.length} chapters across ${byState.size} states -> src/data/chapters.ts`)
