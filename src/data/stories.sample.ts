/**
 * Hand-written placeholder stories for volunteer, voter, campus, and organizer categories.
 *
 * These are illustrative samples used while real stories are being collected. They are
 * merged into the story feed by `stories.ts` alongside `stories.data.ts` (generated from
 * Airtable). Fellow Report stories live in `stories.data.ts` only — never here.
 *
 * Every entry carries `placeholder: true`. The feed renders a notice banner when any
 * visible story carries this flag.
 */

import type { Story } from './stories'

export const SAMPLE_STORIES: Story[] = [
  {
    name: 'Deja W., Columbus',
    quote:
      'I had never knocked a door in my life before VOT. By the end of canvass week I had registered eleven people on my own block. One of them was my landlord.',
    scopes: [{ state: 'OH', districts: ['13'] }],
    category: 'volunteer_story',
    placeholder: true,
  },
  {
    name: 'Anonymous, Raleigh',
    quote:
      'I thought my registration had lapsed after I moved. The organizer at the tabling event ran me through same-day and I was back on the rolls in four minutes. I voted two weeks later.',
    scopes: [{ state: 'NC', districts: ['01'] }],
    category: 'voter_story',
    placeholder: true,
  },
  {
    name: 'Marcus T., University of Michigan',
    quote:
      'Our chapter hit 400 pledges before spring break. We ran tabling shifts seven days a week and built a text bank on a Saturday afternoon with twelve people and someone\'s laptop.',
    scopes: [{ state: 'MI', districts: ['07'] }],
    category: 'campus_story',
    placeholder: true,
  },
  {
    name: 'Priya S., National Organizing Team',
    quote:
      'The relational model is not soft. It is the hardest thing we ask organizers to do — turn their personal network into a program. The chapters that do it well are the ones moving the most votes per dollar anywhere on the board.',
    scopes: [{ state: 'NATIONAL', districts: [] }],
    category: 'organizer_story',
    placeholder: true,
  },
  {
    name: 'Luz M., Philadelphia',
    quote:
      'I went from being a first-time voter at 22 to running the pledge-collection table at my campus the following semester. Nobody told me I was too new. They just handed me the clipboard.',
    scopes: [{ state: 'PA', districts: ['07'] }],
    category: 'voter_story',
    placeholder: true,
  },
  {
    name: 'Jordan K., UW-Madison',
    quote:
      'We did a distributed phone bank the night before the registration deadline. Fourteen volunteers, two hours. By the end we had confirmed 84 new registrations across the district.',
    scopes: [{ state: 'WI', districts: ['03'] }],
    category: 'campus_story',
    placeholder: true,
  },
  {
    name: 'Anonymous, Atlanta',
    quote:
      'I showed up to volunteer because a friend asked me to come. I stayed because someone on the team took twenty minutes to explain what the margin actually was in our district and why it mattered that I was there.',
    scopes: [{ state: 'GA', districts: [] }],
    category: 'volunteer_story',
    placeholder: true,
  },
  {
    name: 'Tomás R., Des Moines',
    quote:
      'Spanish-language canvass hit neighborhoods that had never seen a knock for a federal race. We logged more new contacts in one weekend than the precinct had seen in the entire prior cycle.',
    scopes: [{ state: 'IA', districts: ['03'] }],
    category: 'organizer_story',
    placeholder: true,
  },
]
