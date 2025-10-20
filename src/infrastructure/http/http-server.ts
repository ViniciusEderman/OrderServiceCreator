import Fastify from "fastify";
import "reflect-metadata";

export async function createServer() {
  const app = Fastify({ logger: true });
  return app;
}
