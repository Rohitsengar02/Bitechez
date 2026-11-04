import { buildServer } from './server';

const PORT = Number(process.env.LOCAL_SERVER_PORT || 3001);
const HOST = process.env.LOCAL_SERVER_HOST || '0.0.0.0';

async function start() {
  const server = await buildServer();
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`[Bitechez Server] Local Restaurant Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
