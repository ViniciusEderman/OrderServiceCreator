import { container } from "tsyringe";
import { FastifyRequest, FastifyReply } from "fastify";
import { Logger } from "@/domain/interfaces/logger";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";
import { UpdateOrderSchema } from "@/infrastructure/http/validators/update-order-validator";
import { OrderPresenter } from "@/infrastructure/http/presenters/order-presenter";

const updateOrderStatus = container.resolve(UpdateOrderStatus);

const logger = container.resolve<Logger>("Logger");

export async function UpdateOrderStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const parse = UpdateOrderSchema.safeParse(request.body);

  if (!parse.success) {
    logger.warn("validation error in UpdateOrderStatusController", {
      errors: parse.error.flatten().fieldErrors,
      body: request.body,
    });

    return reply.status(400).send({
      error: "invalid request payload",
    });
  }

  const result = await updateOrderStatus.execute({
    orderId: id,
    newStatus: parse.data.newStatus,
  });

  if (!result.isSuccess) {
    logger.error("create and publisher failed in UpdateOrderStatusController", {
      error: result.getError(),
      data: parse.data,
    });

    return reply.status(400).send({
      error: "operation failed",
    });
  }

  const order = result.getValue();
  return reply.status(200).send(OrderPresenter.toHTTP(order));
}
