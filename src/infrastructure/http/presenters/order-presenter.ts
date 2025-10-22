import { Order } from "@/domain/order/enterprise/entities/order";

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id.toString(),
      client_id: order.clientId,
      current_status: order.currentStatus,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt ? order.updatedAt.toISOString() : null,
    };
  }
}
