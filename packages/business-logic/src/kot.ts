import { KotStatus } from '@bitechez/shared-types';

export const KOT_STATE_TRANSITIONS: Record<KotStatus, KotStatus[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

export function canTransitionKotStatus(current: KotStatus, next: KotStatus): boolean {
  return KOT_STATE_TRANSITIONS[current]?.includes(next) ?? false;
}

export function getKotNextActionLabel(status: KotStatus): string | null {
  switch (status) {
    case 'pending':
      return 'Start Preparing';
    case 'preparing':
      return 'Mark Ready';
    case 'ready':
      return 'Mark Served';
    default:
      return null;
  }
}
