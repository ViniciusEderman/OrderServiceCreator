import { container } from "tsyringe";
import { FastifyRequest, FastifyReply } from "fastify";
import { CreateAndPublishOrder } from "@/domain/order/application/use-cases/order-orchestrator";
import { CreateOrderSchema } from "@/infrastructure/http/validators/create-order-validator";
import { OrderPresenter } from "@/infrastructure/http/presenters/order-presenter";

export async function CreateOrderController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const createAndPublisherOrder = container.resolve(CreateAndPublishOrder);
  const parse = CreateOrderSchema.safeParse(request.body);

  if (!parse.success) {
    return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
  }

  const result = await createAndPublisherOrder.execute(parse.data);

  if (!result.isSuccess) {
    return reply.status(400).send({ error: result.getError() });
  }

  const order = result.getValue();
  return reply.status(201).send(OrderPresenter.toHTTP(order));
}
