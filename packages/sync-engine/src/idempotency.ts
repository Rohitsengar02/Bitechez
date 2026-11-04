import { UUID } from '@bitechez/shared-types';

/**
 * Generate a deterministic idempotency key for restaurant events
 * Format: {outletId}:{entityType}:{entityId}:{version}:{action}
 */
export function generateIdempotencyKey(params: {
  outletId: UUID;
  entityType: string;
  entityId: UUID;
  action: string;
  version?: number;
}): string {
  const version = params.version ?? 1;
  return `${params.outletId}:${params.entityType}:${params.entityId}:v${version}:${params.action}`;
}
