import { onRequestHookHandler } from "fastify";
import { container } from "tsyringe";
import { Logger } from "@/domain/interfaces/logger";

// mock até pensar onde vou armazenar as keys
const SERVICE_TOKENS: Record<string, string> = {
  "service-a": "0QabdgAhZ5P1GzYVmArrLOYjWWvTrBei",
  "service-b": "pfxtLKzmSKNlXptjqa25xQ9AcUslnWEv",
  "test-admin": "Rh98HCraYTyUbM7376gD9YlLMqWV5LqgGhxnWELKOwm0t1YV",
};

export const ApiAuthPlugin: onRequestHookHandler = async (request, reply) => {
  const token = request.headers["apikey"];
  const logger = container.resolve<Logger>("Logger");

  if (!token) {
    logger.warn("missing apiKey", {
      route: request.url,
      ip: request.ip,
    });

    return reply.status(401).send({ error: "unauthorized" });
  }

  const serviceName = Object.keys(SERVICE_TOKENS).find(
    (key) => SERVICE_TOKENS[key] === token
  );

  if (!serviceName) {
    logger.warn("invalid apikey", {
      route: request.url,
      token,
      ip: request.ip,
    });
    return reply.status(401).send({ error: "unauthorized" });
  }

  (request as any).serviceName = serviceName;
};
