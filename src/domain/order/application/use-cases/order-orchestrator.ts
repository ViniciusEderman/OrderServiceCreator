import { injectable, inject } from "tsyringe";
import { Status } from "@/domain/order/enterprise/types/status";
import { Logger } from "@/domain/interfaces/logger";
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
    @inject("Logger") private logger: Logger,
    @inject(CreateOrder) private createOrder: CreateOrder,
    @inject(PublisherOrder) private publisherOrder: PublisherOrder
  ) {}

  async execute(request: CreateAndPublishOrderRequest): Promise<Result<Order>> {
    this.logger.info("running the request orchestrator...", {
      clientId: request.clientId,
      status: request.status,
      timestamp: new Date().toISOString(),
    });

    const orderResult = await this.createOrder.execute(request);

    if (!orderResult.isSuccess) {
      this.logger.error("failed to create order", {
        error: orderResult.getError(),
      });

      return Result.fail(orderResult.getError());
    }

    const order = orderResult.getValue();
    const publishResult = await this.publisherOrder.publish(order);

    if (!publishResult.isSuccess) {
      this.logger.error("failed to publish order", {
        orderId: order.id.toString(),
        error: publishResult.getError(),
      });

      return Result.fail(publishResult.getError());
    }

    this.logger.info("successfully created and published order", {
      orderId: order.id.toString(),
    });
    return Result.ok(order);
  }
}
