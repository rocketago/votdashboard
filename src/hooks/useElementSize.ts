import { useLayoutEffect, useRef, useState } from 'react'

export interface Size {
  width: number
  height: number
}

/**
 * Tracks an element's content box.
 *
 * The map container is one grid column of `main`, whose `grid-template-columns`
 * animates when the detail panel opens. ResizeObserver fires through that animation,
 * so the projection refits every frame and the map tracks the panel instead of
 * snapping once the transition ends.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const apply = (width: number, height: number) =>
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect) apply(rect.width, rect.height)
    })

    observer.observe(el)
    apply(el.clientWidth, el.clientHeight)

    return () => observer.disconnect()
  }, [])

  return [ref, size] as const
}
