# Map geometry

Everything the map draws is served from this folder. Nothing is fetched from a CDN at
runtime, so **swapping in new boundaries is a file drop — no code change, no rebuild of
the JS bundle.** Vite copies `public/` through verbatim.

Both layers are built from a single source, `geo-src/congress.shp`, by one script:

```sh
npm run geo -- geo-src/congress.shp
```

That writes `states.json`, every file in `districts/`, and the manifest. There is no
second source to keep in step.

## `states.json`

State outlines for the national view, as TopoJSON, each feature carrying an `abbr`
property. All 50 states and DC.

These are **dissolved from the district boundaries**, not taken from a separate atlas.
That is deliberate: at state zoom the map draws neighbouring state outlines right up
against the selected state's districts, and geometry from a different source would show
as a halo along every shared border. Dissolving guarantees the two layers agree.

TopoJSON rather than plain GeoJSON because this file loads before anything else — shared
borders are stored once instead of twice, which is the difference between 110 kB and
300 kB over the wire.

## `districts/`

Congressional districts, **one GeoJSON FeatureCollection per state**, named by USPS
abbreviation: `districts/AZ.json`, `districts/GA.json`, and so on. Loaded on demand when
a state is opened, so only the national view costs anything up front.

DC has a state outline but no district file. It elects a delegate rather than a
representative, so there is no district to zoom into.

### The manifest

`districts/manifest.json` tells the app which states have boundaries installed and what
to call them in the map header:

```json
{
  "label": "120th Congress",
  "states": ["AZ", "GA", "MI"]
}
```

A state not listed here renders as "District boundaries unavailable" — the map still
zooms and still shows campus programmes, it just draws no district shapes.

### District numbers

The loader reads a district number off each feature, checking these properties in order:

```
district, DISTRICT, CD119FP, CD118FP, CD117FP, CD116FP,
CD115FP, CD114FP, CD113FP, CDFP, cd, DISTRICTNO
```

then falling back to a number parsed out of `NAMELSAD` / `name` (with "at large" mapped
to `00`). It normalises to two digits, so `4` and `"04"` both become `04` and match the
`AZ-04` ids in `src/data/targets.ts`. The build script writes plain `district`, but the
rest of the list means a hand-dropped Census export also works.

## Installing a new map

The input is a shapefile of all 435 districts. It must be **WGS84 lon/lat** — check that
the `.prj` says `GEOGCS`, and reproject first if it does not — and each feature needs an
`id` property of the form `OH09`: two-letter state, two-digit district, `00` for at-large.
The script derives everything else.

```sh
npm run geo -- geo-src/congress.shp --label "120th Congress"
```

`--label` is optional; without it the label comes from the `congress` field in the
attribute table.

Keep the four shapefile parts together — `.shp`, `.dbf`, `.shx`, `.prj` — and commit them
alongside the output so the generated files can always be rebuilt.

### What the script checks

Dissolving state outlines from districts only works if neighbouring districts meet on
identical vertices, which is true of any map cut from a single topology. Two things would
otherwise fail silently, so the script refuses to finish if it sees them:

- **An edge shared by more than two districts** — the source is not one clean topology and
  the dissolved outline would be wrong.
- **An outline that does not cover the same area as its districts.** This is the real
  guard. Quantization can flatten a thin sliver into a ring of no width, and d3 reads a
  degenerate ring spherically as *everything except itself* — one of those renders as a
  filled globe over the whole map. It is checked after quantization, on the geometry that
  actually ships.

If you already have per-state files from somewhere else, you can still drop them in as
`<ABBR>.json` and add those abbreviations to `manifest.json` by hand — but then `states.json`
no longer matches them, and the halo is back.
