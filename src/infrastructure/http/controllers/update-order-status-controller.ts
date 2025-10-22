import { container } from "tsyringe";
import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";
import { UpdateOrderSchema } from "@/infrastructure/http/validators/update-order-validator";
import { OrderPresenter } from "@/infrastructure/http/presenters/order-presenter";

export async function UpdateOrderStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const updateOrderStatus = container.resolve(UpdateOrderStatus);
  const { id } = request.params as { id: string };
  const parse = UpdateOrderSchema.safeParse(request.body);

  console.log("AHAHAHAHHAHA", id);

  if (!parse.success) {
    return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
  }

  const result = await updateOrderStatus.execute({
    orderId: id,
    newStatus: parse.data.newStatus,
  });

  if (!result.isSuccess) {
    return reply.status(400).send({ error: result.getError().message });
  }

  const order = result.getValue();
  return reply.status(200).send(OrderPresenter.toHTTP(order));
}
