import { Status } from "@/domain/order/enterprise/types/status";
import { Result } from "@/shared/core/result";
import { CreateOrder } from "./create-order";
import { PublisherOrder } from "./publisher-order";


export interface CreateAndPublishOrderRequest {
  clientId: string;
  status: Status;
}

export class CreateAndPublishOrder {
  constructor(
    private createOrder: CreateOrder,
    private publisherOrder: PublisherOrder
  ) {}

  async execute(request: CreateAndPublishOrderRequest) {
    const orderResult = await this.createOrder.execute(request);
    if (orderResult.isFailure) return orderResult;

    const order = orderResult.getValue();
    const publishResult = await this.publisherOrder.publish(order);

    if (publishResult.isFailure) return publishResult;

    return Result.ok(order);
  }
}
