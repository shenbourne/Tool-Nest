/**
 * Reordering rule for drag-and-drop in `ToolFileUpload`.
 *
 * Kept free of DOM access so the index arithmetic — the part that is easy to
 * get wrong and invisible without a drag — stays unit-testable under the
 * repo's node-environment vitest config.
 */

/**
 * A copy of `list` with the item at `from` moved to index `to`. Out-of-range
 * or identical indices are a no-op, but still a copy, so callers can assign
 * the result unconditionally.
 */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  if (!Number.isInteger(from) || !Number.isInteger(to)) return next;
  if (from < 0 || from >= next.length || to < 0 || to >= next.length || from === to) return next;

  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}
