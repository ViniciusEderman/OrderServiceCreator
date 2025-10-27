import { onRequestHookHandler } from "fastify";
import { container } from "tsyringe";
import { Logger } from "@/domain/interfaces/logger";
import { env } from "@/infrastructure/config/env";


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

  const serviceName = Object.keys(env.SERVICE_TOKENS).find(
    (key) => env.SERVICE_TOKENS[key] === token
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
