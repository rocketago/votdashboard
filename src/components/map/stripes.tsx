import { TIER, type TargetType } from '../../data/tiers'

/**
 * A state carrying more than one target type reads as a solid field of its dominant
 * type with slim ribbons of the secondary types laid over it, rather than equal-weight
 * bands competing for attention.
 */
const UNIT = 13
const RIBBON_WIDTH = 5.6
const RIBBON_OFFSET = 3.7

export const stripeId = (types: readonly TargetType[]) => `p-${types.join('-')}`

/** The fill for a state, given its checked target types in ranked order. */
export function stripeFill(types: readonly TargetType[], land: string): string {
  if (!types.length) return land
  if (types.length === 1) return TIER[types[0]!].color
  return `url(#${stripeId(types)})`
}

interface Props {
  /** Every multi-type combination currently on the map. */
  combos: TargetType[][]
}

export function StripePatterns({ combos }: Props) {
  return (
    <defs>
      {combos.map((types) => {
        const size = UNIT * types.length
        return (
          <pattern
            key={stripeId(types)}
            id={stripeId(types)}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
          >
            <rect width={size} height={size} fill={TIER[types[0]!].color} />
            {types.slice(1).map((type, i) => (
              <rect
                key={type}
                x={(i + 1) * UNIT + RIBBON_OFFSET}
                y={-1}
                width={RIBBON_WIDTH}
                height={size + 2}
                rx={1.2}
                fill={TIER[type].color}
              />
            ))}
          </pattern>
        )
      })}
    </defs>
  )
}
