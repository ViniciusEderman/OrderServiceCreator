import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Result, DomainError } from "@/shared/core/result";

export class InMemoryStoreRepository implements StoreRepository {
  public orders: Order[] = [];

  async storeOrder(order: Order): Promise<Result<void, DomainError>> {
    try {
      this.orders.push(order);
      return Result.ok<void, DomainError>(undefined);
    } catch (error) {
      return Result.fail<void, DomainError>(
        new DomainError("STORE_ORDER_FAILED", "failed to store order", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async getOrderById(orderId: string): Promise<Result<Order, DomainError>> {
    const order = this.orders.find(o => o.id.toString() === orderId);

    if (!order) {
      return Result.fail<Order, DomainError>(
        new DomainError("NOT_FOUND", "order not found", { orderId })
      );
    }

    return Result.ok<Order, DomainError>(order);
  }

  async updateOrder(order: Order): Promise<Result<void, DomainError>> {
    const index = this.orders.findIndex(o => o.id.toString() === order.id.toString());

    if (index === -1) {
      return Result.fail<void, DomainError>(
        new DomainError("NOT_FOUND", "order not found for update", {
          orderId: order.id.toString(),
        })
      );
    }

    this.orders[index] = order;

    return Result.ok<void, DomainError>(undefined);
  }
}
