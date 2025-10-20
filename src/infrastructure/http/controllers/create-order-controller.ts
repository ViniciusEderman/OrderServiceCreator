import { container } from "tsyringe";
import { FastifyRequest, FastifyReply } from "fastify";
import { CreateAndPublishOrder } from "@/domain/order/application/use-cases/order-orchestrator";
import { CreateOrderSchema } from "@/presentation/validators/create-order-validator";

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

  if (result.isFailure) {
    return reply.status(400).send({ error: result.getError() });
  }

  return reply.status(201).send(result.getValue());
}
