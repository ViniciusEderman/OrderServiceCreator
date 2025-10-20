import { Logger } from "@/domain/interfaces/logger";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Status } from "@/domain/order/enterprise/types/status";
import { DomainError, Result } from "@/shared/core/result";
import { Order } from "@/domain/order/enterprise/entities/order";

interface UpdateOrderStatusRequest {
  orderId: string;
  newStatus: Status;
}

export class UpdateOrderStatus {
  constructor(
    private storeRepository: StoreRepository,
    private logger: Logger
  ) {}

  async execute({ orderId, newStatus }: UpdateOrderStatusRequest): Promise<Result<Order, DomainError>> {
    this.logger.info("updating status", {
      orderId,
      newStatus,
    });

    const orderResult = await this.storeRepository.getOrderById(orderId);

    if (orderResult.isFailure) {
      this.logger.error("error to get order by id", {
        orderId,
        error: orderResult.getError(),
      });

      return orderResult;
    }

    const order = orderResult.getValue();

    if (order.currentStatus === newStatus) {
      return Result.fail<Order, DomainError>(
        new DomainError("INVALID_STATUS_CHANGE", "Status is already the same.")
      );
    }

    order.statusHistory.push({ status: newStatus, updatedAt: new Date() });
    order.touch();

    const saveResult = await this.storeRepository.updateOrder(order);
    if (saveResult.isFailure) {
      this.logger.error("error to save new status on db", {
        orderId,
        error: saveResult.getError(),
      });

      return Result.fail<Order, DomainError>(saveResult.getError());
    }

    this.logger.info("order status updated", { orderId, newStatus });
    return Result.ok(order);
  }
}
