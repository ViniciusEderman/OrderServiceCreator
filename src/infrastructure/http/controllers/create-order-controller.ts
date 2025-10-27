import { container } from "tsyringe";
import { FastifyRequest, FastifyReply } from "fastify";
import { Logger } from "@/domain/interfaces/logger";
import { OrderOrchestrator } from "@/domain/order/application/use-cases/order-orchestrator";
import { CreateOrderSchema } from "@/infrastructure/http/validators/create-order-validator";
import { OrderPresenter } from "@/infrastructure/http/presenters/order-presenter";

export async function CreateOrderController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parse = CreateOrderSchema.safeParse(request.body);
  const createAndPublisherOrder = container.resolve(OrderOrchestrator);
  const logger = container.resolve<Logger>("Logger");

  if (!parse.success) {
    logger.warn("validation error in CreateOrderController", {
      errors: parse.error.flatten().fieldErrors,
      body: request.body,
    });

    return reply.status(400).send({
      error: "invalid request payload",
    });
  }

  const result = await createAndPublisherOrder.createOrderAndPublisher(parse.data);

  if (!result.isSuccess) {
    logger.error("create and publisher failed in CreateOrderController", {
      error: result.getError(),
      data: parse.data,
    });

    return reply.status(400).send({
      error: "operation failed",
    });
  }

  const order = result.getValue();
  return reply.status(201).send(OrderPresenter.toHTTP(order));
}
