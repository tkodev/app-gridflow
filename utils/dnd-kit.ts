import type { CSSProperties } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragEndEvent } from '@dnd-kit/core'

/**
 * If the drag ended on a new position, returns a new array with that order.
 * Otherwise returns null (no-op drag, invalid target, or unknown ids).
 */
function reorderItemsFromDragEnd<T>(
  items: readonly T[],
  event: DragEndEvent,
  getId: (item: T) => string | number
): T[] | null {
  const { active, over } = event
  if (!over || active.id === over.id) return null

  const oldIndex = items.findIndex((item) => getId(item) === active.id)
  const newIndex = items.findIndex((item) => getId(item) === over.id)
  if (oldIndex === -1 || newIndex === -1) return null

  return arrayMove([...items], oldIndex, newIndex)
}

/**
 * Style object for sortable list items (transform + transition).
 */
function sortableItemStyle(
  transform: Parameters<typeof CSS.Transform.toString>[0],
  transition: string | undefined
): CSSProperties {
  return {
    transform: CSS.Transform.toString(transform),
    transition
  }
}

export { reorderItemsFromDragEnd, sortableItemStyle }
