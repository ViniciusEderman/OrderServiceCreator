import { injectable, inject } from "tsyringe";
import { Status } from "@/domain/order/enterprise/types/status";
import { Result } from "@/shared/core/result";
import { CreateOrder } from "@/domain/order/application/use-cases/create-order";
import { PublisherOrder } from "@/domain/order/application/use-cases/publisher-order";
import { Order } from "@/domain/order/enterprise/entities/order";

export interface CreateAndPublishOrderRequest {
  clientId: string;
  status: Status;
}

@injectable()
export class CreateAndPublishOrder {
  constructor(
    @inject(CreateOrder) private createOrder: CreateOrder,
    @inject(PublisherOrder) private publisherOrder: PublisherOrder
  ) {}

  async execute(request: CreateAndPublishOrderRequest): Promise<Result<Order>> {
    const orderResult = await this.createOrder.execute(request);
    if (!orderResult.isSuccess) {
      return Result.fail(orderResult.getError());
    }

    const order = orderResult.getValue();
    const publishResult = await this.publisherOrder.publish(order);

    if (!publishResult.isSuccess) {
      return Result.fail(publishResult.getError());
    }

    return Result.ok(order);
  }
}
