import { injectable, inject } from 'tsyringe';
import { Status } from "@/domain/order/enterprise/types/status";
import { Result } from "@/shared/core/result";
import { CreateOrder } from "./create-order";
import { PublisherOrder } from "./publisher-order";

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

  async execute(request: CreateAndPublishOrderRequest) {
    const orderResult = await this.createOrder.execute(request);
    if (orderResult.isFailure) return orderResult;

    const order = orderResult.getValue();
    const publishResult = await this.publisherOrder.publish(order);

    if (publishResult.isFailure) return publishResult;

    return Result.ok(order);
  }
}
