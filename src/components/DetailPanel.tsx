import { CHAPTER_STATUS, STATE_NAME, STATES } from '../data/states'
import { TIER } from '../data/tiers'
import { SETTING_LABEL, chaptersIn } from '../data/chapters'
import { campusesIn } from '../data/campuses'
import { eventsIn, PROGRAM_TYPE, shortDate } from '../data/events'
import { targetLabel } from '../data/targets'

const pct = (value: number, goal: number) => Math.min(100, Math.round((value / goal) * 100))

interface Props {
  /** The state to describe, or null when nothing is selected. */
  abbr: string | null
  onClose: () => void
}

export function DetailPanel({ abbr, onClose }: Props) {
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
        <div className="pfoot">
          <button>Add to target board</button>
        </div>
      </aside>
    )
  }

  const chapter = CHAPTER_STATUS[record.chapter]
  const events = eventsIn(abbr)
  const chapters = chaptersIn(abbr)
  const campuses = campusesIn(abbr)
  const tierColor = TIER[record.tier].color

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
                : `${record.chapters} active chapter${record.chapters === 1 ? '' : 's'} · ${record.vol} trained volunteers`}
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
            <div className="d">
              {pct(record.reg, record.goal)}% of {record.goal.toLocaleString()} goal
            </div>
            <div className="bar">
              <i style={{ width: `${pct(record.reg, record.goal)}%`, background: tierColor }} />
            </div>
          </div>
          <div className="metric">
            <div className="k">Pledges to vote</div>
            <div className="v mono">{record.pledge.toLocaleString()}</div>
            <div className="d">
              {pct(record.pledge, record.pgoal)}% of {record.pgoal.toLocaleString()} goal
            </div>
            <div className="bar">
              <i
                style={{
                  width: `${pct(record.pledge, record.pgoal)}%`,
                  background: 'var(--soft)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="psec">
        <h4>Scheduled events · {events.length}</h4>
        {events.length ? (
          events.map((e) => (
            <div className="ev" key={`${e.date}-${e.title}`}>
              <div className="date">{shortDate(e)}</div>
              <div>
                <div className="t">{e.title}</div>
                <div className="m">
                  <span
                    className="swatch-inline"
                    style={{ background: PROGRAM_TYPE[e.type].color }}
                  />
                  {PROGRAM_TYPE[e.type].label}
                  {e.meta ? ` · ${e.meta}` : ''}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty">Nothing on the calendar. Assign an organizer to build a plan.</p>
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
        <h4>Chapters · {chapters.length}</h4>
        {chapters.length ? (
          <div className="plist">
            {chapters.map((c) => (
              <div className="p" key={c.name}>
                <b>{c.name}</b>
                <span>{SETTING_LABEL[c.setting]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">No chartered chapter here yet.</p>
        )}
      </div>

      <div className="psec">
        <h4>Campus programs</h4>
        {campuses.length ? (
          <div className="plist">
            {campuses.map((c) => (
              <div className="p" key={c.name}>
                <b>{c.name}</b>
                <span>unconfirmed</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">No campus program yet.</p>
        )}
      </div>

      <div className="psec">
        <h4>Partner organizations</h4>
        {record.partners.length ? (
          <div className="plist">
            {record.partners.map((p) => (
              <div className="p" key={p}>
                <b>{p}</b>
                <span>coalition</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">No formal partners on record.</p>
        )}
      </div>

      <div className="pfoot">
        <button>Open state plan</button>
        <button className="ghost">Export brief</button>
      </div>
    </aside>
  )
}
