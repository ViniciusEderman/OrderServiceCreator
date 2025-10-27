import { injectable, inject } from "tsyringe";
import { Result } from "@/shared/core/result";
import { Status } from "@/domain/order/enterprise/types/status";
import { Logger } from "@/domain/interfaces/logger";
import { CreateOrder } from "@/domain/order/application/use-cases/create-order";
import { PublisherOrder } from "@/domain/order/application/use-cases/publisher-order";
import { Order } from "@/domain/order/enterprise/entities/order";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";

export interface CreateAndPublishOrderRequest {
  clientId: string;
  status: Status;
}

export interface UpdateAndPublishOrderRequest {
  orderId: string;
  newStatus: Status;
}

@injectable()
export class OrderOrchestrator {
  constructor(
    @inject("Logger") private logger: Logger,
    @inject(CreateOrder) private createOrder: CreateOrder,
    @inject(PublisherOrder) private publisherOrder: PublisherOrder,
    @inject(UpdateOrderStatus) private updateStatusOrder: UpdateOrderStatus
  ) {}

  async createOrderAndPublisher(
    request: CreateAndPublishOrderRequest
  ): Promise<Result<Order>> {
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

  async updateOrderAndPublisher(
    request: UpdateAndPublishOrderRequest
  ): Promise<Result<Order>> {
    this.logger.info("running the update order orchestrator...", {
      orderId: request.orderId,
      newStatus: request.newStatus,
      timestamp: new Date().toISOString(),
    });

    const updateResult = await this.updateStatusOrder.execute({
      orderId: request.orderId,
      newStatus: request.newStatus,
    });

    if (!updateResult.isSuccess) {
      this.logger.error("failed to create order", {
        orderId: request.orderId,
        error: updateResult.getError(),
      });

      return Result.fail(updateResult.getError());
    }

    const updatedOrder = updateResult.getValue();
    const publishResult = await this.publisherOrder.publish(updatedOrder);

    if (!publishResult.isSuccess) {
      this.logger.error("failed to publish order", {
        orderId: updatedOrder.id.toString(),
        error: publishResult.getError(),
      });

      return Result.fail(publishResult.getError());
    }

    this.logger.info("successfully updated and published order", {
      orderId: updatedOrder.id.toString(),
      statusHistory: updatedOrder.statusHistory,
    });

    return Result.ok(updatedOrder);
  }
}
