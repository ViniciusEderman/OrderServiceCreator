import Fastify from "fastify";
import "reflect-metadata";
import { orderRoutes } from "@/infrastructure/http/routes/order-routes";

export async function createServer() {
  const app = Fastify({ logger: true });

  await app.register(orderRoutes, { prefix: "/api" });
  
  return app;
}
