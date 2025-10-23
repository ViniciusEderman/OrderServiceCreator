import "reflect-metadata";
import Fastify from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyHelmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { orderRoutes } from "@/infrastructure/http/routes/order-routes";

export async function createServer() {
  const app = Fastify({ logger: true });

  app.register(fastifyHelmet);
  
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (req, context) => ({
      error: "too many requests",
      retryAfter: context.after,
    }),
  });

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
