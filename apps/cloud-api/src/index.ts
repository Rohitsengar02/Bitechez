import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

async function main() {
  await fastify.register(cors, { origin: true });

  fastify.get('/health', async () => {
    return { status: 'ok', service: 'Bitechez Cloud Platform API', timestamp: new Date().toISOString() };
  });

  const PORT = Number(process.env.CLOUD_API_PORT || 3002);
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Bitechez Cloud] Cloud API running at port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();

