import { container } from "tsyringe";
import { FastifyRequest, FastifyReply } from "fastify";
import { Logger } from "@/domain/interfaces/logger";
import { OrderOrchestrator } from "@/domain/order/application/use-cases/order-orchestrator";
import { UpdateOrderSchema } from "@/infrastructure/http/validators/update-order-validator";
import { OrderPresenter } from "@/infrastructure/http/presenters/order-presenter";

export async function UpdateOrderStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const orderOrchestrator = container.resolve(OrderOrchestrator);
  const logger = container.resolve<Logger>("Logger");
  const { id } = request.params as { id: string };
  const parse = UpdateOrderSchema.safeParse(request.body);

  if (!parse.success) {
    logger.warn("validation error in UpdateOrderStatusController", {
      errors: parse.error.flatten().fieldErrors,
      body: request.body,
      orderId: id,
    });

    return reply.status(400).send({
      error: "invalid request payload",
    });
  }

  const result = await orderOrchestrator.updateOrderAndPublisher({
    orderId: id,
    newStatus: parse.data.newStatus,
  });

  if (!result.isSuccess) {
    logger.error("create and publisher failed in UpdateOrderStatusController", {
      error: result.getError(),
      orderId: id,
      data: parse.data,
    });

    return reply.status(500).send({
      error: "operation failed",
    });
  }

  const order = result.getValue();
  return reply.status(200).send(OrderPresenter.toHTTP(order));
}
