import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { InfraError, Result } from "@/shared/core/result";
import { prisma } from "@/infrastructure/db/prisma";

export class PrismaStoreRepository implements StoreRepository {
  async storeOrder(order: Order): Promise<Result<void, InfraError>> {
    try {
      await prisma.order.create({
        data: {
          id: order.id.toString(),
          clientId: order.clientId,
          statusHistory: order.statusHistory,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      });

      return Result.ok<void, InfraError>(undefined);
    } catch (error) {
      return Result.fail(
        new InfraError("STORE_ORDER_FAILED", "Failed to store order", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async updateOrder(order: Order): Promise<Result<void, InfraError>> {
    try {
      await prisma.order.update({
        where: { id: order.id.toString() },
        data: {
          statusHistory: order.statusHistory,
          updatedAt: order.updatedAt,
        },
      });

      return Result.ok<void, InfraError>(undefined);
    } catch (error) {
      return Result.fail(
        new InfraError("UPDATE_ORDER_FAILED", "Failed to update order", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async getOrderById(id: string): Promise<Result<Order, InfraError>> {
    try {
      const orderData = await prisma.order.findUnique({
        where: { id },
      });

      if (!orderData) {
        return Result.fail(
          new InfraError("ORDER_NOT_FOUND", `Order with id ${id} not found`)
        );
      }

      const order = Order.create(
        {
          clientId: orderData.clientId,
          statusHistory: orderData.statusHistory,
          createdAt: orderData.createdAt,
          updatedAt: orderData.updatedAt,
        },
        orderData.id
      );

      return Result.ok(order);
    } catch (error) {
      return Result.fail(
        new InfraError("GET_ORDER_FAILED", "Failed to get order by id", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}
