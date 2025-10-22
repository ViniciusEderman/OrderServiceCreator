import { inject, injectable } from "tsyringe";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Result, AppError } from "@/shared/core/result";
import { Logger } from "@/domain/interfaces/logger";

@injectable()
export class InMemoryStoreRepository implements StoreRepository {
  public orders: Order[] = [];

  constructor(@inject("Logger") private logger: Logger) {}

  async storeOrder(order: Order): Promise<Result<void>> {
    try {
      this.orders.push(order);
      this.logger.info("order stored in memory", {
        orderId: order.id.toString(),
      });
      return Result.ok(undefined);
    } catch (error) {
      this.logger.error("failed to store order in memory", {
        orderId: order.id.toString(),
        error,
      });
      return Result.fail(
        new AppError("STORE_ORDER_FAILED", "failed to store order in memory", {
          orderId: order.id.toString(),
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async getOrderById(orderId: string): Promise<Result<Order>> {
    const order = this.orders.find((o) => o.id.toString() === orderId);

    if (!order) {
      this.logger.warn("order not found in memory", { orderId });
      return Result.fail(
        new AppError("NOT_FOUND", "order not found in memory", { orderId })
      );
    }

    this.logger.info("order retrieved from memory", { orderId });
    return Result.ok(order);
  }

  async updateOrder(order: Order): Promise<Result<void>> {
    const index = this.orders.findIndex(
      (o) => o.id.toString() === order.id.toString()
    );

    if (index === -1) {
      this.logger.warn("order not found for update in memory", {
        orderId: order.id.toString(),
      });
      return Result.fail(
        new AppError("NOT_FOUND", "order not found for update in memory", {
          orderId: order.id.toString(),
        })
      );
    }

    this.orders[index] = order;
    this.logger.info("order updated in memory", {
      orderId: order.id.toString(),
    });
    return Result.ok(undefined);
  }
}
