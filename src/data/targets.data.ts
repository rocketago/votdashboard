/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `scripts/sync-airtable.mjs` from the Target Type columns on the States and Districts tables.
 * Re-run `npm run sync` to refresh it.
 *
 * The board. A district row is a race; a state row is a statewide designation.
 *
 * Airtable has no column separating a Senate race from a statewide programme, so a
 * targeted state reads as "OH statewide" rather than "OH-Sen". Adding that distinction
 * means a column here, not a change in the app.
 */

export const SOFT_TARGETS: string[] = [
  'CA-48',
  'CO-03',
  'CO-08',
  'GA',
  'IA',
  'IA-01',
  'IA-02',
  'IA-03',
  'ME',
  'MT-01',
  'NC',
  'NE-02',
  'NJ-07',
  'NM-02',
  'NY-17',
  'OH-01',
  'OH-09',
  'OH-13',
  'TX-15',
  'VA-01',
  'VA-02',
  'VA-05',
]

export const HARD_TARGETS: string[] = [
  'AK',
  'AK-00',
  'AZ-02',
  'AZ-06',
  'CA-13',
  'CA-22',
  'CA-45',
  'CA-48',
  'CO-03',
  'CO-08',
  'FL-22',
  'GA',
  'IA',
  'IA-01',
  'IA-02',
  'IA-03',
  'ME',
  'MI',
  'MI-04',
  'MI-07',
  'MI-10',
  'MT-01',
  'NC',
  'NC-11',
  'NE-02',
  'NH',
  'NH-01',
  'NJ-07',
  'NM-02',
  'NY-17',
  'OH',
  'OH-01',
  'OH-09',
  'OH-13',
  'PA',
  'PA-01',
  'PA-07',
  'PA-08',
  'PA-10',
  'TX',
  'TX-15',
  'VA-01',
  'VA-02',
  'VA-05',
  'WA-03',
  'WI',
  'WI-01',
  'WI-03',
]

export const DEVELOPMENT_TARGETS: string[] = [
  'NC',
  'NM',
  'NM-02',
  'NV',
  'SC',
  'VA',
  'VA-01',
  'VA-02',
  'VA-05',
]

export const SECONDARY_DEVELOPMENT_TARGETS: string[] = [
  'AZ',
  'GA',
  'MI',
  'MI-07',
  'OH',
  'PA',
  'PA-01',
  'PA-07',
  'TX',
  'WI',
]
