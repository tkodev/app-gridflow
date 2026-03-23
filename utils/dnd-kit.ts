import type { CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'

/**
 * Style object for sortable list items (transform + transition).
 */
export function sortableItemStyle(
  transform: Parameters<typeof CSS.Transform.toString>[0],
  transition: string | undefined
): CSSProperties {
  return {
    transform: CSS.Transform.toString(transform),
    transition
  }
}
