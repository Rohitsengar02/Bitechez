import { SyncInboxEvent, SyncEventType, UUID } from '@bitechez/shared-types';

export function isDuplicateInboxEvent(
  processedKeys: Set<string>,
  idempotencyKey: string
): boolean {
  return processedKeys.has(idempotencyKey);
}

export function createInboxRecord(params: {
  id: UUID;
  idempotencyKey: string;
  sourceDeviceId: UUID;
  eventType: SyncEventType;
  entityId: UUID;
}): SyncInboxEvent {
  return {
    id: params.id,
    idempotencyKey: params.idempotencyKey,
    sourceDeviceId: params.sourceDeviceId,
    eventType: params.eventType,
    entityId: params.entityId,
    processedAt: new Date().toISOString(),
  };
}
