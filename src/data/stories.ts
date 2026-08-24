/**
 * Story Bank — real-people testimonials tied to VOT organizing work.
 *
 * PLACEHOLDER DATA. Every name, quote, and detail below was written during the
 * design session and has not been collected from real participants. Replace verbatim
 * with real stories once they are collected; the feed renders whatever is here.
 *
 * Scope model mirrors `quickFacts.ts` exactly so the sidebar filter tree, scope-chip
 * components, and the `useScopeFilters`-style hook are all reusable without changes.
 *
 * Airtable-sync compatibility
 * ---------------------------
 * `stories.data.ts` is structured to be a GENERATED file once a "Story Bank" table
 * is added to the VOT 2026 Soft Side Reports Airtable base. The future sync script
 * reads: Name, Quote, State, Districts (linked record), Category. Base id and table
 * name go in the `SOURCE` object in `scripts/sync-airtable.mjs`, matching the pattern
 * used for `targets.data.ts` and `events.data.ts`. No changes to this file are needed
 * when the sync is wired up.
 */

import { TARGET_STATES, targetDistrictsIn } from './targets'

export const NATIONAL = 'NATIONAL'

/**
 * Geographic scope for a story. Identical shape to `FactScope` in `quickFacts.ts` so
 * the filter tree, chip rendering, and scope-key utilities share the same logic.
 */
export interface StoryScope {
  /** State abbreviation, or `NATIONAL` for a story that applies everywhere. */
  state: string
  /** District numbers without the state prefix, e.g. `['07', '13']`. Empty = statewide. */
  districts: string[]
}

/**
 * Story category / type.
 *
 * Four types cover the range of voices VOT collects:
 *   - `volunteer_story`  — a volunteer sharing their organizing experience
 *   - `voter_story`      — a newly registered or engaged voter recounting their experience
 *   - `campus_story`     — a campus chapter story, typically about a program milestone
 *   - `organizer_story`  — a professional or chapter organizer's account
 *
 * Kept as a string union (not an enum) so a future Airtable "Category" select field maps
 * directly: Airtable values are lowercased and underscored to match.
 */
export type StoryCategory = 'volunteer_story' | 'voter_story' | 'campus_story' | 'organizer_story'

export const STORY_CATEGORY_LABEL: Record<StoryCategory, string> = {
  volunteer_story: 'Volunteer',
  voter_story: 'Voter',
  campus_story: 'Campus',
  organizer_story: 'Organizer',
}

export interface Story {
  /**
   * Airtable record id — absent in hand-written placeholder data, populated by sync.
   * The feed uses `name + quote` as a React key when this is absent.
   */
  airtableId?: string
  /** Display name / attribution shown beneath the quote. "First L., City" or "Anonymous, State". */
  name: string
  /** The testimonial text — a first-person quote or short narrative, unedited. */
  quote: string
  scopes: StoryScope[]
  category: StoryCategory
  /**
   * PLACEHOLDER — marks hand-written sample stories that have not been collected from
   * real participants. Mirrors the `invented: true` convention used in `events.data.ts`.
   * The feed renders a notice banner when any visible story carries this flag.
   */
  placeholder?: true
}

export { STORIES as ALL_STORIES } from './stories.data'
import { STORIES as ALL_STORIES } from './stories.data'

/* ---------- board-scoping (mirrors quickFacts.ts scopedToBoard) ---------- */

const ON_BOARD = new Set(TARGET_STATES)
const targetDistricts = new Map(
  TARGET_STATES.map((abbr) => [abbr, new Set(targetDistrictsIn(abbr).map((id) => id.slice(3)))]),
)

/**
 * The same story, with any scope naming something off the target board removed.
 * A story left with no scopes at all is dropped rather than shown as applying to nothing.
 * National-scoped stories always pass.
 */
function scopedToBoard(story: Story): Story | null {
  const scopes: StoryScope[] = []

  for (const scope of story.scopes) {
    if (scope.state === NATIONAL) {
      scopes.push(scope)
      continue
    }
    if (!ON_BOARD.has(scope.state)) continue
    if (!scope.districts.length) {
      scopes.push(scope)
      continue
    }

    const targeted = targetDistricts.get(scope.state)
    const districts = scope.districts.filter((d) => targeted?.has(d))
    if (districts.length) scopes.push({ ...scope, districts })
  }

  return scopes.length ? { ...story, scopes } : null
}

export const STORIES: Story[] = ALL_STORIES.map(scopedToBoard).filter(
  (s): s is Story => s !== null,
)

/* ---------- filter utilities (mirrors quickFacts.ts) ---------- */

/** Filter key for one scope: `'NATIONAL'`, `'GA'` (statewide), or `'OH-13'`. */
export function scopeKeys(story: Story): string[] {
  return story.scopes.flatMap((s) => {
    if (s.state === NATIONAL) return [NATIONAL]
    if (!s.districts.length) return [s.state]
    return s.districts.map((d) => `${s.state}-${d}`)
  })
}

export interface ScopeIndex {
  /** States that appear in the feed, sorted. */
  states: string[]
  /** Per state: whether a statewide story exists, and which districts appear. */
  byState: Record<string, { statewide: boolean; districts: string[] }>
  hasNational: boolean
}

/** Builds the sidebar's filter tree from whatever is in the feed. */
export function buildScopeIndex(stories: Story[]): ScopeIndex {
  const byState: ScopeIndex['byState'] = {}
  let hasNational = false

  for (const story of stories) {
    for (const s of story.scopes) {
      if (s.state === NATIONAL) {
        hasNational = true
        continue
      }
      const entry = (byState[s.state] ??= { statewide: false, districts: [] })
      if (!s.districts.length) entry.statewide = true
      for (const d of s.districts) {
        if (!entry.districts.includes(d)) entry.districts.push(d)
      }
    }
  }

  for (const entry of Object.values(byState)) entry.districts.sort()

  return { states: Object.keys(byState).sort(), byState, hasNational }
}
