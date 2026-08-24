import { useState } from 'react'
import {
  STORIES,
  STORY_CATEGORY_LABEL,
  STORY_CATEGORY_ORDER,
  type Story,
  type StoryCategory,
} from '../../data/stories'

interface Props {
  onOpenState: (abbr: string) => void
}

export function StoryBankView({ onOpenState }: Props) {
  const [activeCategories, setActiveCategories] = useState<Set<StoryCategory>>(
    new Set(STORY_CATEGORY_ORDER),
  )

  const toggle = (cat: StoryCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  const visible = STORIES.filter((s) => activeCategories.has(s.category))

  return (
    <div className="storywrap">
      <div className="storyhead">
        <h2>Story Bank</h2>
        <p>
          Field conversations and fellow reports from across the program. Use these to ground
          messaging in real voter contact.
        </p>
      </div>

      <div className="story-filters">
        {STORY_CATEGORY_ORDER.map((cat) => {
          const on = activeCategories.has(cat)
          return (
            <button
              key={cat}
              className={`story-cat-btn${on ? ' active' : ''}`}
              onClick={() => toggle(cat)}
            >
              {STORY_CATEGORY_LABEL[cat]}
            </button>
          )
        })}
      </div>

      <div className="story-feed">
        {visible.length === 0 ? (
          <p className="empty">No stories match the current filters.</p>
        ) : (
          visible.map((story) => (
            <StoryItem key={story.id} story={story} onOpenState={onOpenState} />
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
    <div className="story-item">
      <div className="scope">
        {story.location ? (
          <button onClick={() => onOpenState(story.scope.state)}>{story.location}</button>
        ) : (
          <button onClick={() => onOpenState(story.scope.state)}>
            {story.scope.state} statewide
          </button>
        )}
        <span className="topic">{STORY_CATEGORY_LABEL[story.category]}</span>
      </div>

      <blockquote className="story-quote">{story.quote}</blockquote>
      <p className="story-attribution">{story.name}</p>
    </div>
  )
}
