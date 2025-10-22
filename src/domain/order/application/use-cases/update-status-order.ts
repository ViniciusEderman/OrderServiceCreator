import { inject, injectable } from "tsyringe";
import { Logger } from "@/domain/interfaces/logger";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Status } from "@/domain/order/enterprise/types/status";
import { AppError, Result } from "@/shared/core/result";
import { Order } from "@/domain/order/enterprise/entities/order";

interface UpdateOrderStatusRequest {
  orderId: string;
  newStatus: Status;
}

@injectable()
export class UpdateOrderStatus {
  constructor(
    @inject("StoreRepository") private storeRepository: StoreRepository,
    @inject("Logger") private logger: Logger
  ) { }

  async execute({
    orderId,
    newStatus,
  }: UpdateOrderStatusRequest): Promise<Result<Order>> {
    this.logger.info("updating status", {
      orderId,
      newStatus,
    });

    const orderResult = await this.storeRepository.getOrderById(orderId);

    if (!orderResult.isSuccess) {
      this.logger.error("error to get order by id", {
        orderId,
        error: orderResult.getError(),
      });

      return Result.fail(orderResult.getError());
    }

    const order = orderResult.getValue();

    if (order.currentStatus === newStatus) {
      return Result.fail(
        new AppError("INVALID_STATUS_CHANGE", "Status is already the same.")
      );
    }

    order.updateStatus(newStatus);
    const saveResult = await this.storeRepository.updateOrder(order);
    
    if (!saveResult.isSuccess) {
      this.logger.error("error to save new status on db", {
        orderId,
        error: saveResult.getError(),
      });

      return Result.fail(saveResult.getError());
    }

    this.logger.info("order status updated", { orderId, newStatus });
    return Result.ok(order);
  }
}
