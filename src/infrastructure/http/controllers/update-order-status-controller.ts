import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";
import { UpdateOrderSchema } from "@/presentation/validators/update-order-validator";

export class UpdateOrderStatusController {
  constructor(private updateOrderStatus: UpdateOrderStatus) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parse = UpdateOrderSchema.safeParse(request.body);

    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
    }

    const result = await this.updateOrderStatus.execute({
      orderId: id,
      newStatus: parse.data.newStatus,
    });

    if (result.isFailure) {
      return reply.status(400).send({ error: result.getError().message });
    }

    return reply.status(200).send(result.getValue());
  }
}
