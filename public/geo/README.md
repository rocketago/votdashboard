# Map geometry

Everything the map draws is served from this folder. Nothing is fetched from a CDN at
runtime, so **swapping in new boundaries is a file drop — no code change, no rebuild of
the JS bundle.** Vite copies `public/` through verbatim.

## `states-10m.json`

State outlines, as TopoJSON, keyed by Census state FIPS. Vendored from the
[`us-atlas`](https://github.com/topojson/us-atlas) npm package:

```sh
cp node_modules/us-atlas/states-10m.json public/geo/states-10m.json
```

These are stable — you only need to touch this file if you want a different
generalisation (`states-110m.json` is smaller and coarser).

## `districts/`

Congressional districts, **one GeoJSON FeatureCollection per state**, named by USPS
abbreviation: `districts/AZ.json`, `districts/GA.json`, and so on.

### The manifest

`districts/manifest.json` tells the app which states have boundaries installed and what
to call them in the map header:

```json
{
  "label": "119th Congress",
  "states": ["AZ", "GA", "MI"]
}
```

A state not listed here renders as "District boundaries unavailable" — the map still
zooms and still shows campus programmes, it just draws no district shapes. That is the
current state of this repo: **no district boundaries are installed yet.**

### District numbers

The loader reads a district number off each feature, checking these properties in order:

```
district, DISTRICT, CD119FP, CD118FP, CD117FP, CD116FP,
CD115FP, CD114FP, CD113FP, CDFP, cd, DISTRICTNO
```

then falling back to a number parsed out of `NAMELSAD` / `name` (with "at large" mapped
to `00`). It normalises to two digits, so `4` and `"04"` both become `04` and match the
`AZ-04` ids in `src/data/states.ts`.

**In practice this means a raw Census export drops straight in with no property editing.**

## Installing current district boundaries

The Census cartographic boundary files are the authoritative source. For the 119th
Congress:

<https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_cd119_500k.zip>

1. Download and convert to GeoJSON. [mapshaper](https://github.com/mbloch/mapshaper) is
   the least painful route, and simplifying keeps the files small enough to serve:

   ```sh
   npx mapshaper cb_2024_us_cd119_500k.shp \
     -simplify 8% keep-shapes \
     -proj wgs84 \
     -o format=geojson cd119.json
   ```

2. Split it per state and write the manifest:

   ```sh
   npm run geo:districts -- cd119.json --label "119th Congress"
   ```

   The script groups features by their `STATEFP` property, writes one file per state
   into this folder, and regenerates `manifest.json`.

3. Reload. The map header picks the new label up automatically.

If you already have per-state files from somewhere else, just drop them in as
`<ABBR>.json` and add those abbreviations to `manifest.json` by hand.
