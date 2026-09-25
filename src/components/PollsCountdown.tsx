import { useEffect, useState } from 'react'

/**
 * When the earliest polls open on Election Day. 6:00 AM Eastern is the earliest
 * poll-opening time among the states carrying a 2026 target race; expressed as a
 * fixed UTC instant (EST, UTC-5 — DST has ended by November 3) so the countdown
 * reads the same regardless of the viewer's own clock.
 */
const FIRST_POLLS_OPEN = Date.UTC(2026, 10, 3, 11, 0, 0)

interface TimeLeft {
  days: number
  hours: number
  minutes: number
}

function timeLeft(now: number): TimeLeft | null {
  const ms = FIRST_POLLS_OPEN - now
  if (ms <= 0) return null
  const totalMinutes = Math.floor(ms / 60_000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }
}

/** Days/hours/minutes until the first polls open, ticking once a minute. */
export function PollsCountdown() {
  const [left, setLeft] = useState<TimeLeft | null>(() => timeLeft(Date.now()))

  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft(Date.now())), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pcountdown">
      <h3>Polls open in</h3>
      {left ? (
        <div className="pclock">
          <div className="pcell">
            <div className="pn">{left.days}</div>
            <div className="pl">days</div>
          </div>
          <div className="pcell">
            <div className="pn">{left.hours}</div>
            <div className="pl">hrs</div>
          </div>
          <div className="pcell">
            <div className="pn">{left.minutes}</div>
            <div className="pl">min</div>
          </div>
        </div>
      ) : (
        <div className="pclock live">Polls are open</div>
      )}
    </div>
  )
}
