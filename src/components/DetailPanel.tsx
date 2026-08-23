import { useEffect, useState } from 'react'

import { CHAPTER_STATUS, STATE_NAME, STATES } from '../data/states'
import { TIER } from '../data/tiers'
import { chaptersIn, type ChapterSetting } from '../data/chapters'
import { campusesIn } from '../data/campuses'
import { eventsIn, PROGRAM_TYPE, shortDate } from '../data/events'
import { targetLabel } from '../data/targets'

/**
 * How each kind of chapter reads, and the order the programme is listed in: broadest
 * footprint first, down to individual campuses, with fellows last.
 *
 * Airtable's `Campus Type` is the distinction that matters here — `Chapter Type` only
 * separates colleges from everything else, so it would fold high schools in with cities.
 */
const CHAPTER_LABEL: Record<ChapterSetting, string> = {
  state: 'state chapter',
  community: 'community chapter',
  college: 'campus chapter',
  'high-school': 'high school chapter',
}

const CHAPTER_ORDER: ChapterSetting[] = ['state', 'community', 'college', 'high-school']

/** Events shown before the list is collapsed behind a button. */
const EVENT_PREVIEW = 5

interface ProgramEntry {
  name: string
  detail: string
  label: string
}

/**
 * Everything the campus program runs in a state: chapters of every kind, then the
 * campuses carrying fellows. The two come from different Airtable bases and are
 * genuinely different things, but they are one programme to the organiser reading this.
 */
function programIn(abbr: string): ProgramEntry[] {
  const chapters = chaptersIn(abbr)
    .map((c) => ({ name: c.name, detail: CHAPTER_LABEL[c.setting], label: c.setting }))
    .sort(
      (a, b) =>
        CHAPTER_ORDER.indexOf(a.label as ChapterSetting) -
          CHAPTER_ORDER.indexOf(b.label as ChapterSetting) || a.name.localeCompare(b.name),
    )

  const fellows = campusesIn(abbr).map((c) => ({
    name: c.name,
    detail: `fellows · ${c.district}`,
    label: 'fellows',
  }))

  return [...chapters, ...fellows]
}

interface Props {
  /** The state to describe, or null when nothing is selected. */
  abbr: string | null
  /**
   * Whether the panel is actually open. `abbr` lingers after closing so the panel has
   * something to render while it slides shut, so it cannot answer this on its own.
   */
  open: boolean
  onClose: () => void
}

export function DetailPanel({ abbr, open, onClose }: Props) {
  // Collapses again whenever the panel moves to another state, or is closed and
  // reopened. Opening a state should start at the short list, not wherever the last one
  // was left.
  const [expanded, setExpanded] = useState(false)
  useEffect(() => setExpanded(false), [abbr, open])

  if (!abbr) return <aside className="panel" />

  const record = STATES[abbr]

  if (!record) {
    return (
      <aside className="panel">
        <div className="ptop">
          <div className="row">
            <div>
              <h2>{STATE_NAME[abbr] ?? abbr}</h2>
              <div className="abbr">{abbr} · not on the target board</div>
            </div>
            <button className="close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <div className="psec">
          <p className="empty">
            No coordinated program this cycle. Add it to the board to start tracking.
          </p>
        </div>
      </aside>
    )
  }

  const chapter = CHAPTER_STATUS[record.chapter]
  const events = eventsIn(abbr)
  const shownEvents = expanded ? events : events.slice(0, EVENT_PREVIEW)
  const chapters = chaptersIn(abbr)
  const campuses = campusesIn(abbr)
  const program = programIn(abbr)

  // The section mixes two things, so the heading counts them separately rather than
  // reporting a total that is neither a chapter count nor a campus count.
  const programCounts = [
    chapters.length && `${chapters.length} chapter${chapters.length === 1 ? '' : 's'}`,
    campuses.length && `${campuses.length} fellowship campus${campuses.length === 1 ? '' : 'es'}`,
  ].filter(Boolean)

  return (
    <aside className="panel">
      <div className="ptop">
        <div className="row">
          <div>
            <h2>{record.name}</h2>
            <div className="abbr">
              {abbr} · {record.targets.length} target race
              {record.targets.length === 1 ? '' : 's'} · {chapters.length} chapter
              {chapters.length === 1 ? '' : 's'}
            </div>
          </div>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="tags">
          {record.types.map((type) => (
            <span key={type} className="tag on" style={{ background: TIER[type].color }}>
              {TIER[type].label}
            </span>
          ))}
        </div>
      </div>

      <div className="psec">
        <h4>Chapter presence</h4>
        <div className="chapter">
          <span className="dot" style={{ background: chapter.color }} />
          <div>
            <div className="t">{chapter.label}</div>
            <div className="m">
              {record.chapter === 'none'
                ? 'No chartered chapter · nearest program out of state'
                : `${record.chapters} active chapter${record.chapters === 1 ? '' : 's'}`}
            </div>
          </div>
        </div>
      </div>

      <div className="psec">
        <h4>Program to date</h4>
        <div className="metrics">
          <div className="metric">
            <div className="k">Voters registered</div>
            <div className="v mono">{record.reg.toLocaleString()}</div>
          </div>
          <div className="metric">
            <div className="k">Pledges to vote</div>
            <div className="v mono">{record.pledge.toLocaleString()}</div>
          </div>
          <div className="metric">
            <div className="k">Students engaged</div>
            <div className="v mono">{record.students.toLocaleString()}</div>
          </div>
          <div className="metric">
            <div className="k">Chapters</div>
            <div className="v mono">{record.chapters}</div>
          </div>
        </div>
      </div>

      <div className="psec">
        <h4>Scheduled events · {events.length}</h4>
        {events.length ? (
          shownEvents.map((e) => (
            <div className="ev" key={`${e.date}-${e.time}-${e.title}`}>
              <div className="date">{shortDate(e)}</div>
              <div>
                <div className="t">{e.title}</div>
                <div className="m">
                  <span
                    className="swatch-inline"
                    style={{ background: PROGRAM_TYPE[e.type].color }}
                  />
                  {PROGRAM_TYPE[e.type].label} · {e.time} ET
                  {e.meta ? ` · ${e.meta}` : ''}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty">Nothing on the calendar. Assign an organizer to build a plan.</p>
        )}
        {events.length > EVENT_PREVIEW && (
          <button className="more" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show fewer' : `Show all ${events.length}`}
          </button>
        )}
      </div>

      <div className="psec">
        <h4>Targets · {record.targets.length}</h4>
        {record.targets.length ? (
          <div className="chips">
            {record.targets.map((target) => (
              <span
                className="chip"
                key={target.id}
                // Left edge carries the target's own dominant type, which can differ
                // from the state's — a Hard-only race in a Soft + Hard state, say.
                style={{ borderLeft: `3px solid ${TIER[target.types[0]!].color}` }}
                title={target.types.map((t) => TIER[t].label).join(' + ')}
              >
                {targetLabel(target)}
              </span>
            ))}
          </div>
        ) : (
          <p className="empty">No races targeted.</p>
        )}
      </div>

      <div className="psec">
        <h4>Campus program{programCounts.length ? ` · ${programCounts.join(' · ')}` : ''}</h4>
        {program.length ? (
          <div className="plist">
            {program.map((entry) => (
              <div className="p" key={`${entry.label}-${entry.name}`}>
                <b>{entry.name}</b>
                <span>{entry.detail}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">Nothing running here yet.</p>
        )}
      </div>

    </aside>
  )
}
