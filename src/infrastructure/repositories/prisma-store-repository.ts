import { injectable } from "tsyringe";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { AppError, Result } from "@/shared/core/result";
import { prisma } from "@/infrastructure/db/prisma";
import { Status } from "@/domain/order/enterprise/types/status";
import { UniqueEntityID } from "@/shared/entities/unique-entity-id";

@injectable()
export class PrismaStoreRepository implements StoreRepository {
  async storeOrder(order: Order): Promise<Result<void>> {
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

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError("STORE_ORDER_FAILED", "failed to store order", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async updateOrder(order: Order): Promise<Result<void>> {
    try {
      console.log("Infra - orderId:", order.id.toString());
      console.log("Infra - clientId:", order.clientId.toString());

      await prisma.order.update({
        where: { id: order.id.toString() },
        data: {
          statusHistory: order.statusHistory,
          updatedAt: order.updatedAt,
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError("UPDATE_ORDER_FAILED", "failed to update order", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async getOrderById(id: string): Promise<Result<Order>> {
    try {
      const orderData = await prisma.order.findUnique({
        where: { id },
      });

      if (!orderData) {
        return Result.fail(
          new AppError("ORDER_NOT_FOUND", `order with id ${id} not found`)
        );
      }

      const order = Order.create(
        {
          clientId: orderData.clientId,
          statusHistory: orderData.statusHistory as unknown as Array<{
            status: Status;
            updatedAt: Date;
          }>,
        },
        new UniqueEntityID(orderData.id)
      );

      return Result.ok(order);
    } catch (error) {
      return Result.fail(
        new AppError("GET_ORDER_FAILED", "failed to get order by id", {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}
