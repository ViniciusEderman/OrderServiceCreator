import { Order } from "@/domain/order/enterprise/entities/order";
import { Result } from "@/shared/core/result";

export interface StoreRepository {
  storeOrder(order: Order): Promise<Result<void>>;
  updateOrder(order: Order): Promise<Result<void>>;
  getOrderById(id: string): Promise<Result<Order>>;
}
