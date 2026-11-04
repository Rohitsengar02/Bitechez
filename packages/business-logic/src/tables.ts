import { TableStatus } from '@bitechez/shared-types';

export const TABLE_STATE_TRANSITIONS: Record<TableStatus, TableStatus[]> = {
  available: ['occupied', 'reserved'],
  occupied: ['cleaning', 'available'],
  reserved: ['occupied', 'available'],
  cleaning: ['available'],
};

export function canTransitionTableStatus(current: TableStatus, next: TableStatus): boolean {
  return TABLE_STATE_TRANSITIONS[current]?.includes(next) ?? false;
}
