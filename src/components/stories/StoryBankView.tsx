import { useMemo } from 'react'
import { NATIONAL, STORIES, STORY_CATEGORY_LABEL, scopeKeys, type Story } from '../../data/stories'

interface Props {
  checked: Record<string, boolean>
  isVisible: (abbr: string) => boolean
  onOpenState: (abbr: string) => void
}

export function StoryBankView({ checked, isVisible, onOpenState }: Props) {
  const hasPlaceholders = STORIES.some((s) => s.placeholder)

  const items = useMemo(
    () =>
      STORIES.filter((story) => {
        // A story shows if any scope it covers is checked...
        if (!scopeKeys(story).some((key) => checked[key])) return false

        // ...and if at least one of its states is still on the board.
        // National-only stories always pass.
        const states = story.scopes.filter((s) => s.state !== NATIONAL)
        return states.length === 0 || states.some((s) => isVisible(s.state))
      }),
    [checked, isVisible],
  )

  return (
    <div className="factwrap">
      <div className="fhead">
        <h2>Story Bank</h2>
        <p>
          Real voices from the organizing program. Stories are scoped to the states and
          districts where they were collected — use the sidebar to filter by location.
        </p>
      </div>

      {hasPlaceholders && (
        <div className="factnote">
          Placeholder stories. These are sample entries written during the design session
          and have not been collected from real participants. Replace with real testimonials
          before the tab goes live.
        </div>
      )}

      <div className="feed">
        {items.length === 0 ? (
          <div className="item">
            <p className="empty">No stories match the current filters.</p>
          </div>
        ) : (
          items.map((story) => (
            <StoryItem
              key={story.airtableId ?? `${story.name}:${story.quote.slice(0, 40)}`}
              story={story}
              onOpenState={onOpenState}
            />
          ))
        )}
      </div>
    </div>
  )
}

function StoryItem({
  story,
  onOpenState,
}: {
  story: Story
  onOpenState: (abbr: string) => void
}) {
  return (
    <div className="item">
      <div className="scope">
        {story.scopes.map((scope) => {
          if (scope.state === NATIONAL) {
            return (
              <button className="nat" key="nat" disabled>
                NATIONAL
              </button>
            )
          }

          if (!scope.districts.length) {
            return (
              <button key={scope.state} onClick={() => onOpenState(scope.state)}>
                {scope.state} statewide
              </button>
            )
          }

          return scope.districts.map((d) => (
            <button key={`${scope.state}-${d}`} onClick={() => onOpenState(scope.state)}>
              {scope.state}-{d}
            </button>
          ))
        })}
        <span className="topic">{STORY_CATEGORY_LABEL[story.category]}</span>
      </div>

      <h3>{story.quote}</h3>
      <p className="story-attribution">— {story.name}</p>
    </div>
  )
}
