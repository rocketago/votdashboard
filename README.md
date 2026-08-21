# VOT Target Dashboard

Coordinated operations dashboard for Voters of Tomorrow's 2026 cycle — the target
board, the national programme calendar, and the messaging feed in one place.

Built from the Claude Design prototype (`vot-targets.html`) as a Vite + React +
TypeScript app.

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview  # serve the build
```

`dist/` is plain static files — deploy it anywhere (Netlify, Pages, S3). There is no
server and no API.

## The three tabs

**Map.** The 24-state target board. States are filled by target type; a state carrying
more than one shows a solid field of its dominant type with slim ribbons of the others
over it. Ranking is **Soft > Hard > Development** everywhere — the filter order, the
dominant fill, and the chip order in the detail panel all read from `TARGET_ORDER` in
`src/data/tiers.ts`, so reordering that array moves all three together.

Clicking a state zooms to it, draws its congressional districts, and opens the detail
panel: chapter status, registrations and pledges against goal, scheduled events, target
districts, campus programmes, partner orgs. The header's States / Districts / Campuses
switch changes what the national board overlays.

**Calendar.** Every scheduled event nationally, one grid per month, colour-coded by
programme type with the four type filters and a running tally. Clicking an event jumps
to the map and opens that state.

**Quick Facts.** Messaging blurbs, each led by chips for the states and districts it
applies to. The sidebar filters by district, grouped by state. Clicking a chip opens
that state on the map.

The target-type filters are shared across all three tabs, so unchecking Development also
drops development-only states from the calendar and the feed.

## Swapping in real data

Everything user-facing is placeholder. Each data module says so at the top and is typed,
so the compiler will tell you if a replacement is the wrong shape.

| What | Where | Notes |
| --- | --- | --- |
| **The target board** | `src/data/targets.ts` | Three lists of race ids. Everything about targeting derives from these — see below |
| Chapter status and partners | `src/data/states.ts` | `STATE_SOURCE`, organizational facts only |
| Registration / pledge / volunteer figures | `src/lib/metrics.ts` | **All fake.** Deterministically derived from the state abbreviation. See below. |
| Campus programmes | `src/data/campuses.ts` | Name, coordinates, chapter vs prospect |
| Events | `src/data/events.ts` | ISO dates; twelve are flagged `invented: true` |
| Messaging copy | `src/data/quickFacts.ts` | Scopes drive the sidebar filter tree automatically |
| Palette | `src/styles/tokens.css` and `src/data/tiers.ts` | Both, deliberately — see below |
| **Map geometry** | `public/geo/` | **See `public/geo/README.md`** |

### Updating the target board

`src/data/targets.ts` holds three lists, written the way the organizing team writes
them — `OH-09` for a House district, `NC-Sen` for a Senate race, `AK-00` for an at-large
seat, `NV` for a statewide target with no specific race:

```ts
export const SOFT_TARGETS = ['OH-09', 'NC-Sen', ...]
export const HARD_TARGETS = ['OH-Sen', 'OH-09', ...]
export const DEVELOPMENT_TARGETS = ['SC', 'VA', 'NM', 'NV']
```

Editing those lists is the whole update. Which states appear on the map, what colour
each takes, which districts highlight on zoom, the running totals, and which events and
blurbs stay in scope are all derived. A state carries the union of its races'
designations, so a state with one Soft race and three Hard ones reads as Soft + Hard.

Two properties of the current board worth knowing:

- **Soft is a strict subset of Hard.** All 20 Soft targets also appear under Hard, so the
  two are treated as overlapping designations one race can hold at once, not as mutually
  exclusive tiers. If they were meant to be exclusive, the Soft list needs removing from
  the Hard list rather than a code change.
- **Statewide Development targets sit alongside race targets.** VA and NM carry both, so
  they read as Soft + Hard + Development. SC and NV are Development only.

### The numbers are fake

Every registration, pledge, goal and volunteer count is generated from a hash of the
state abbreviation, so a state shows the same figures on every load. This is a stable
mock, not real data, and it is not marked as such in the UI.

When real figures arrive, put them straight onto the `STATE_SOURCE` records and delete
`src/lib/metrics.ts` — `StateRecord` already carries the fields, so nothing downstream
changes. The `scaleTier` field exists only to feed the generator and can go with it.

### Map geometry

Nothing is fetched from a CDN at runtime; state outlines and district boundaries are
served from `public/geo/`. Swapping in new boundaries is a file drop plus one line in a
manifest — no code change.

The installed map is the **120th Congress** — all 435 districts on the lines that will be
in effect for the 2026 election. It is built from `geo-src/congress.shp`, which is
committed alongside it:

```sh
npm run geo -- geo-src/congress.shp
```

That one command writes the per-state district files, the manifest, and the national
state outlines. The state outlines are *dissolved from the districts* rather than taken
from a separate atlas, so the two layers agree exactly — geometry from two sources shows
as a halo along every shared border once you zoom into a state. Details, including the
checks the script refuses to finish without, are in
[`public/geo/README.md`](public/geo/README.md).

The loader reads district numbers from any of the usual Census property names, so a raw
export drops in without editing properties.

### Why the palette lives in two places

SVG presentation attributes cannot resolve `var(--soft)` — that was a real bug in the
prototype, where unfiltered states silently lost their fill. The map layers therefore
read literal hex values from `TIER` in `src/data/tiers.ts`, while the CSS chrome uses
the tokens in `src/styles/tokens.css`. Change a target-type colour in **both**.

## Layout

```
geo-src/             the district shapefile everything in public/geo/ is built from
public/geo/          state + district geometry, and how to replace it
scripts/             build-geo.mjs — shapefile -> per-state districts + state outlines
src/data/            all content: states, campuses, events, quick facts, palette
src/lib/             geo loading, placeholder metric generation
src/hooks/           filter state, element sizing
src/components/      Header, TargetFilters, DetailPanel, map/, calendar/, facts/
src/styles/          tokens.css (palette), app.css (layout, transcribed from the design)
```

## Known gaps

- All figures and all messaging copy are placeholders pending sign-off.
- The placeholder Quick Facts copy still references districts that are no longer on the
  board (`AZ-01`, `TX-28`, `NV-01`, `MI-08`, `GA-13`, `MN-02` and others). The feed and
  its filter tree derive from whatever copy is in `src/data/quickFacts.ts`, so replacing
  the copy with real talking points fixes this on its own.
- Chapter statuses, partner orgs and campus lists are still design-era placeholders, and
  are retained for the 15 states that came off the board so nothing is lost if they
  return.
- Event programme types were assigned during design, not by programme leads, and twelve
  distributed programmes were invented to populate the Distributed filters. They are
  flagged `invented: true` in `src/data/events.ts`.
- The panel's "Open state plan", "Export brief" and "Add to target board" buttons are
  inert — the prototype had no destinations for them.
