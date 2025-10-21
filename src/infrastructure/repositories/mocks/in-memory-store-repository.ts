import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Result, AppError } from "@/shared/core/result";

export class InMemoryStoreRepository implements StoreRepository {
  public orders: Order[] = [];

  async storeOrder(order: Order): Promise<Result<void>> {
    try {
      this.orders.push(order);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError("STORE_ORDER_FAILED", "failed to store order", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async getOrderById(orderId: string): Promise<Result<Order>> {
    const order = this.orders.find((o) => o.id.toString() === orderId);

    if (!order) {
      return Result.fail(
        new AppError("NOT_FOUND", "order not found", { orderId })
      );
    }

    return Result.ok(order);
  }

  async updateOrder(order: Order): Promise<Result<void>> {
    const index = this.orders.findIndex(
      (o) => o.id.toString() === order.id.toString()
    );

    if (index === -1) {
      return Result.fail(
        new AppError("NOT_FOUND", "order not found for update", {
          orderId: order.id.toString(),
        })
      );
    }

    this.orders[index] = order;
    return Result.ok(undefined);
  }
}
