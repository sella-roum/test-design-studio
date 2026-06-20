import type { EntityStatus } from '../types';

export type ListOptions = {
  includeRemoved?: boolean;
};

export function filterRemoved<T extends { status: EntityStatus }>(
  items: T[],
  options?: ListOptions,
): T[] {
  if (options?.includeRemoved) {
    return items;
  }
  return items.filter((item) => item.status !== 'removed');
}
