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
        clientId: raw.clientId,
        statusHistory: Array.isArray(raw.statusHistory)
          ? raw.statusHistory.map((item: any) => ({
              status: item.status,
              updatedAt: new Date(item.updatedAt),
            }))
          : [],

        createdAt: new Date(raw.createdAt),
        updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPersistence(order: Order): any {
    return {
      id: order.id.toString(),
      clientId: order.clientId,
      statusHistory: order.statusHistory.map((item) => ({
        status: item.status,
        updatedAt: item.updatedAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toUpdatePersistence(order: Order): Partial<any> {
    return {
      statusHistory: order.statusHistory.map((item) => ({
        status: item.status,
        updatedAt: item.updatedAt,
      })),
      updatedAt: order.updatedAt,
    };
  }
}
