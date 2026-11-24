export interface Positioned {
  id: string;
  position: number;
}

/** The position that places a new item last in the collection. */
export function nextPosition(items: readonly Positioned[]): number {
  return items.reduce((max, item) => Math.max(max, item.position), -1) + 1;
}

/**
 * Reorders a visible subset of items. The positions currently used by the visible items are
 * reused in their new order, so items that are not visible keep their place in the global order.
 * Returns only the items whose position changed.
 */
export function reorderVisible<T extends Positioned>(
  all: readonly T[],
  visibleIdsInNewOrder: readonly string[],
): T[] {
  const visibleSet = new Set(visibleIdsInNewOrder);
  const slots = all
    .filter((item) => visibleSet.has(item.id))
    .map((item) => item.position)
    .sort((a, b) => a - b);
  const byId = new Map(all.map((item) => [item.id, item]));

  const changed: T[] = [];
  visibleIdsInNewOrder.forEach((id, index) => {
    const item = byId.get(id);
    const position = slots[index];
    if (item && position !== undefined && item.position !== position) {
      changed.push({ ...item, position });
    }
  });
  return changed;
}
