import { FastifyInstance } from 'fastify';
import { SyncPushBatchRequest, SyncPushBatchResponse } from '@bitechez/shared-types';

const processedIdempotencyKeys = new Set<string>();

export async function syncRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: SyncPushBatchRequest }>('/api/sync/push', async (request, reply) => {
    const { deviceId, outletId, events } = request.body;
    const acknowledgedIds: string[] = [];
    const failedIds: Array<{ id: string; error: string; retryable: boolean }> = [];

    for (const evt of events) {
      try {
        // Inbox Deduplication Check
        if (processedIdempotencyKeys.has(evt.idempotencyKey)) {
          console.log(`[Bitechez Server] Deduplicated event: ${evt.idempotencyKey}`);
          acknowledgedIds.push(evt.id);
          continue;
        }

        // Process event
        processedIdempotencyKeys.add(evt.idempotencyKey);
        acknowledgedIds.push(evt.id);

        // Broadcast to other LAN terminals
        if ((fastify as any).io) {
          (fastify as any).io.to(`outlet:${outletId}`).emit(evt.eventType, evt.payload);
        }
      } catch (err: any) {
        failedIds.push({ id: evt.id, error: err.message, retryable: true });
      }
    }

    const response: SyncPushBatchResponse = {
      acknowledgedIds,
      failedIds,
      serverTime: new Date().toISOString(),
    };

    return reply.send(response);
  });
}

