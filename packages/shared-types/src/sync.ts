import { UUID } from './models';

export type SyncEventType =
  | 'order.created'
  | 'order.updated'
  | 'order.cancelled'
  | 'kot.created'
  | 'kot.preparing'
  | 'kot.ready'
  | 'kot.completed'
  | 'table.updated'
  | 'request.created'
  | 'request.resolved'
  | 'payment.completed'
  | 'menu.updated'
  | 'stock.updated'
  | 'device.heartbeat';

export interface SyncOutboxEvent<T = unknown> {
  id: UUID;
  idempotencyKey: string;
  eventType: SyncEventType;
  entityType: string;
  entityId: UUID;
  payload: T;
  version: number;
  outletId: UUID;
  deviceId: UUID;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface SyncInboxEvent {
  id: UUID;
  idempotencyKey: string;
  sourceDeviceId: UUID;
  eventType: SyncEventType;
  entityId: UUID;
  processedAt: string;
}

export interface SyncCheckpoint {
  deviceId: UUID;
  outletId: UUID;
  lastEventVersion: number;
  lastSyncedTimestamp: string;
}

export interface SyncPushBatchRequest {
  deviceId: UUID;
  outletId: UUID;
  events: SyncOutboxEvent[];
}

export interface SyncPushBatchResponse {
  acknowledgedIds: UUID[];
  failedIds: Array<{ id: UUID; error: string; retryable: boolean }>;
  serverTime: string;
}

