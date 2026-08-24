/**
 * PLACEHOLDER DATA — hand-authored sample stories for development.
 *
 * Fellow-report stories (category: fellow_report) correspond to real rows in the
 * "Fellow Reports" table in the VOT 2026 Soft Side Reports base
 * (appwnA2eTd4GfxZWE, tbll3QFJsbGVvU4w0). The sync script will replace these once
 * that table has live submissions. Each fellow_report carries a `location` field
 * sourced from the "Where did this happen?" form question, and `name` from "Name".
 *
 * Other categories are invented here to fill the filter UI.
 */

import type { Story } from './stories'

export const STORIES: Story[] = [
  {
    id: 'fr-001',
    name: 'Maya Okonkwo',
    quote:
      "She was 19, had never voted, and kept saying 'my vote doesn't matter.' We talked for 20 minutes about the transit referendum on the ballot. By the end she was asking how to check if she was already registered. That was the moment for me.",
    scope: { state: 'PA' },
    location: 'campus quad tabling table',
    category: 'fellow_report',
  },
  {
    id: 'fr-002',
    name: 'Diego Reyes',
    quote:
      "Knocked a door at an off-campus complex and a senior answered — thought we were canvassing for a candidate. When I explained we were just helping people pledge to vote, she said she hadn't missed an election in 50 years. Ended up spending half an hour hearing her stories. Best conversation of the whole week.",
    scope: { state: 'WI' },
    location: 'off-campus apartment complex canvass',
    category: 'fellow_report',
  },
  {
    id: 'fr-003',
    name: 'Priya Nair',
    quote:
      "A first-gen student I met at the voter reg table told me her parents couldn't vote but always told her to. She teared up a little when I handed her the pledge card. That one will stay with me.",
    scope: { state: 'MI' },
    location: 'student union voter registration drive',
    category: 'fellow_report',
  },
  {
    id: 'vs-001',
    name: 'Jordan Brooks',
    quote:
      'Spent three hours phone banking and connected with a family in the district who had never heard of our organization. By the end of the call they were asking how their daughter could get involved.',
    scope: { state: 'AZ' },
    category: 'volunteer_story',
  },
  {
    id: 'cs-001',
    name: 'State University VOT Chapter',
    quote:
      'We tabled at freshman orientation for the first time and collected 340 pledge cards in two days. The incoming class was more civically engaged than any group we have seen.',
    scope: { state: 'NV' },
    category: 'campus_story',
  },
]
