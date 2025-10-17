import { Order } from "@/domain/order/enterprise/entities/order";
import { DomainError, Result } from "@/shared/core/result";

export interface StoreRepository {
  storeOrder(order: Order): Promise<Result<void, DomainError>>;
  updateOrder(order: Order): Promise<Result<void, DomainError>>;
  getOrderById(id: string): Promise<Result<Order, DomainError>>;
};
