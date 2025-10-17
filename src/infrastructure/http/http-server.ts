import Fastify from "fastify";

export async function createServer() {
  const app = Fastify({ logger: true });
  return app;
}
