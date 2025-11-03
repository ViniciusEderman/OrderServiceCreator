import { Order } from "@/domain/order/enterprise/entities/order";
import { UniqueEntityID } from "@/shared/entities/unique-entity-id";

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

  static toDomain(raw: any): Order {
    return Order.create(
      {
        clientId: raw.client_id,
        statusHistory: raw.status_history.map((item: any) => ({
          status: item.status,
          updatedAt: new Date(item.updated_at),
        })),
        createdAt: new Date(raw.created_at),
        updatedAt: raw.updated_at ? new Date(raw.updated_at) : null,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPersistence(order: Order): any {
    return {
      id: order.id.toString(),
      client_id: order.clientId,
      status_history: order.statusHistory.map((item) => ({
        status: item.status,
        updated_at: item.updatedAt,
      })),
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    };
  }

  static toUpdatePersistence(order: Order): Partial<any> {
    return {
      statusHistory: order.statusHistory.map(item => ({
        status: item.status,
        updatedAt: item.updatedAt,
      })),
      updatedAt: order.updatedAt,
    };
  }
}
