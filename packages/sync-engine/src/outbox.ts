import { SyncOutboxEvent, SyncEventType, UUID } from '@bitechez/shared-types';
import { generateIdempotencyKey } from './idempotency';

export function createOutboxEvent<T>(params: {
  id: UUID;
  eventType: SyncEventType;
  entityType: string;
  entityId: UUID;
  payload: T;
  outletId: UUID;
  deviceId: UUID;
  version?: number;
}): SyncOutboxEvent<T> {
  const version = params.version ?? 1;
  const idempotencyKey = generateIdempotencyKey({
    outletId: params.outletId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.eventType,
    version,
  });

  return {
    id: params.id,
    idempotencyKey,
    eventType: params.eventType,
    entityType: params.entityType,
    entityId: params.entityId,
    payload: params.payload,
    version,
    outletId: params.outletId,
    deviceId: params.deviceId,
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };
}

