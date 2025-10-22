import Fastify from "fastify";
import "reflect-metadata";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { orderRoutes } from "@/infrastructure/http/routes/order-routes";

export async function createServer() {
  const app = Fastify({ logger: true });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Order Orchestrator",
        description: "",
        version: "1.0.0",
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });
  
  await app.register(orderRoutes, { prefix: "/api/v1" });

  return app;
}
