/**
 * Messaging blurbs for the organizing team.
 *
 * PLACEHOLDER COPY. Every headline, figure and body below was written during the
 * design session and has not been through research sign-off. Replace verbatim with
 * the real talking points; the feed renders whatever is here.
 */

import { TARGET_STATES, targetDistrictsIn } from './targets'

export const NATIONAL = 'NATIONAL'

export interface FactScope {
  /** State abbreviation, or `NATIONAL` for a blurb that applies everywhere. */
  state: string
  /** District numbers without the state prefix, e.g. `['01','04']`. Empty = statewide. */
  districts: string[]
}

export interface QuickFact {
  /** Topic label shown on the right of the scope row. Not a filter. */
  topic: string
  scopes: FactScope[]
  headline: string
  body: string
  /** Which programmes the blurb is cleared for. */
  useFor: string
}

const ALL_FACTS: QuickFact[] = [
  {
    topic: 'Turnout math',
    scopes: [{ state: NATIONAL, districts: [] }],
    headline: 'Under-30 voters are 17% of the 2026 eligible electorate',
    body: 'That is roughly 41 million people, and about a third of them will be voting in their first federal election. The number only matters where turnout is organized, which is why the board is 39 states and not 50.',
    useFor: 'All programs',
  },
  {
    topic: 'Deadlines',
    scopes: [{ state: 'AZ', districts: ['01', '04', '06'] }],
    headline: 'Arizona closes registration 29 days before Election Day',
    body: 'There is no same-day registration in Arizona. Every conversation before the deadline is worth more than three after it, so the Maricopa and Pima programs front-load registration and shift to pledge collection the week the books close.',
    useFor: 'Doors, campus tabling',
  },
  {
    topic: 'Cost of living',
    scopes: [{ state: 'NV', districts: ['01', '03', '04'] }],
    headline: 'Clark County rent is up 34% since 2019',
    body: 'Median wages for workers under 30 rose 11% over the same period. When canvassers lead with housing costs in Las Vegas, conversation length roughly doubles compared with a generic voting ask.',
    useFor: 'Doors, texts',
  },
  {
    topic: 'Student debt',
    scopes: [{ state: 'MI', districts: ['07', '08'] }],
    headline: 'One in five adults under 35 in the Lansing and Flint corridors carries student debt',
    body: 'Both districts sit inside commuting distance of a public university. Debt is the most reliable door opener in MI-07 and MI-08, and it converts into a pledge more often than any other issue we track.',
    useFor: 'Doors, campus tabling',
  },
  {
    topic: 'Reproductive rights',
    scopes: [
      { state: 'GA', districts: [] },
      { state: 'NC', districts: ['01', '06'] },
    ],
    headline: 'Reproductive care access is the top-cited issue for women under 30 in both states',
    body: 'In Georgia and North Carolina it outranks cost of living among that group by a wide margin. Lead with care access at HBCU and campus events, then close on the registration ask.',
    useFor: 'Campus tabling, events',
  },
  {
    topic: 'Climate',
    scopes: [{ state: 'TX', districts: ['15', '28', '34'] }],
    headline: 'The Rio Grande Valley crossed 100 degrees on 41 days last year',
    body: 'Heat is not an abstraction in the RGV, it is a work and school issue. Organizers there frame climate as utility bills and outdoor labor conditions rather than emissions targets.',
    useFor: 'Doors, texts',
  },
  {
    topic: 'Gun safety',
    scopes: [{ state: 'PA', districts: ['07', '08', '10', '17'] }],
    headline: 'Gun violence is the most-cited safety concern among under-30 voters in the four target districts',
    body: 'It polls ahead of both crime generally and drug policy. The Philadelphia and Allentown programs pair it with the early-vote ask, which is where turnout is softest.',
    useFor: 'Doors, events',
  },
  {
    topic: 'Turnout math',
    scopes: [{ state: 'WI', districts: ['01', '03'] }],
    headline: 'Under-30 voters moved the last statewide margin by more than the margin itself',
    body: 'The statewide result came down to about 26,000 votes. Voters under 30 broke for the winner by 18 points. Madison and the Driftless districts are where that math is made.',
    useFor: 'Leadership, funders',
  },
  {
    topic: 'Deadlines',
    scopes: [{ state: 'NC', districts: ['01', '06', '14'] }],
    headline: 'North Carolina same-day registration runs only during early voting',
    body: 'A voter who misses the mail deadline can still register in person at an early-voting site in their county. That single fact recovers a meaningful share of otherwise-lost conversations after the book closing.',
    useFor: 'Doors, texts, campus tabling',
  },
  {
    topic: 'Cost of living',
    scopes: [
      { state: 'GA', districts: ['01', '02', '13'] },
      { state: 'FL', districts: ['13', '27'] },
    ],
    headline: 'Grocery and utility costs lead youth economic concerns in the Southeast programs',
    body: 'Neither state has a competitive-rent story like Nevada. The economic frame that lands is weekly cost, not housing, and it works better on texts than at the door.',
    useFor: 'Texts',
  },
  {
    topic: 'Student debt',
    scopes: [{ state: 'OH', districts: ['01', '09', '13'] }],
    headline: 'Two-year and trade students outnumber four-year students across the Ohio target districts',
    body: 'Messaging built for four-year campuses does not reach them. Toledo and Youngstown programs run at community colleges and job sites instead, on a schedule that assumes people work.',
    useFor: 'Doors, campus tabling',
  },
  {
    topic: 'Turnout math',
    scopes: [
      { state: 'MN', districts: ['02'] },
      { state: 'NH', districts: ['01'] },
    ],
    headline: 'Both districts are decided inside a 5,000-vote band',
    body: 'Small absolute margins make distributed programs unusually efficient here. A relational push through existing chapter networks moves more votes per dollar than a new canvass.',
    useFor: 'Leadership, funders',
  },
  {
    topic: 'Climate',
    scopes: [
      { state: 'CO', districts: ['08'] },
      { state: 'NM', districts: [] },
    ],
    headline: 'Water is the climate frame that carries the Southwest',
    body: 'Drought and water rights poll well ahead of national climate language with young voters in both states. Keep the ask local: what the shortage does to jobs, food prices, and rural households.',
    useFor: 'Doors, events',
  },
  {
    topic: 'Deadlines',
    scopes: [{ state: NATIONAL, districts: [] }],
    headline: 'Fifteen states let voters register on Election Day',
    body: 'Everywhere else the deadline is the program. Before writing a state plan, check which side of that line it falls on, because it determines whether September is registration or persuasion.',
    useFor: 'All programs',
  },
]

const ON_BOARD = new Set(TARGET_STATES)
const targetDistricts = new Map(
  TARGET_STATES.map((abbr) => [abbr, new Set(targetDistrictsIn(abbr).map((id) => id.slice(3)))]),
)

/**
 * The same blurb, with any scope naming something off the target board removed.
 *
 * The copy still cites districts that have come off the board. Every chip is a link to a
 * state, and the sidebar's filter tree is built from these scopes, so leaving them in
 * would offer races we are not running. A blurb left with no scope at all is dropped
 * rather than shown as applying to nothing.
 */
function scopedToBoard(fact: QuickFact): QuickFact | null {
  const scopes: FactScope[] = []

  for (const scope of fact.scopes) {
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

  return scopes.length ? { ...fact, scopes } : null
}

export const QUICK_FACTS: QuickFact[] = ALL_FACTS.map(scopedToBoard).filter(
  (f): f is QuickFact => f !== null,
)

/** Filter key for one scope: `'NATIONAL'`, `'GA'` (statewide), or `'AZ-01'`. */
export function scopeKeys(fact: QuickFact): string[] {
  return fact.scopes.flatMap((s) => {
    if (s.state === NATIONAL) return [NATIONAL]
    if (!s.districts.length) return [s.state]
    return s.districts.map((d) => `${s.state}-${d}`)
  })
}

export interface ScopeIndex {
  /** States that appear in the feed, sorted. */
  states: string[]
  /** Per state: whether a statewide blurb exists, and which districts appear. */
  byState: Record<string, { statewide: boolean; districts: string[] }>
  hasNational: boolean
}

/** Builds the sidebar's filter tree from whatever is in the feed. */
export function buildScopeIndex(facts: QuickFact[]): ScopeIndex {
  const byState: ScopeIndex['byState'] = {}
  let hasNational = false

  for (const fact of facts) {
    for (const s of fact.scopes) {
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
