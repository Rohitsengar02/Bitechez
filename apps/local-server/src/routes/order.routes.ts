import { FastifyInstance } from 'fastify';

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'Bitechez Local Restaurant Server',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/api/orders/active', async (request) => {
    const { outletId } = request.query as { outletId?: string };
    return [];
  });

  fastify.get('/api/tables', async () => {
    return [];
  });
}
