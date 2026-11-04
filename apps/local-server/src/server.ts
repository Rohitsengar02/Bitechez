import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketIO } from './websocket/socket-handler';
import { syncRoutes } from './routes/sync.routes';
import { orderRoutes } from './routes/order.routes';

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Attach Socket.IO
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  (fastify as any).io = io;
  setupSocketIO(io);

  // Register routes
  await fastify.register(orderRoutes);
  await fastify.register(syncRoutes);

  return fastify;
}

