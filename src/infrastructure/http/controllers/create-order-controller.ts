import { injectable, inject } from 'tsyringe';
import { FastifyRequest, FastifyReply } from "fastify";
import { CreateAndPublishOrder } from "@/domain/order/application/use-cases/order-orchestrator";
import { CreateOrderSchema } from "@/presentation/validators/create-order-validator";

@injectable()
export class CreateOrderController {
  constructor(
    @inject(CreateAndPublishOrder) private createAndPublishOrder: CreateAndPublishOrder
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const parse = CreateOrderSchema.safeParse(request.body);

    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
    }

    const result = await this.createAndPublishOrder.execute(parse.data);

    if (result.isFailure) {
      return reply.status(400).send({ error: result.getError()});
    }

    return reply.status(201).send(result.getValue());
  }
}
