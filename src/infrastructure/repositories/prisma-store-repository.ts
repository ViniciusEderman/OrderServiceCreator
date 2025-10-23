import { injectable, inject } from "tsyringe";
import { prisma } from "@/infrastructure/db/prisma";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Status } from "@/domain/order/enterprise/types/status";
import { Logger } from "@/domain/interfaces/logger";
import { UniqueEntityID } from "@/shared/entities/unique-entity-id";
import { AppError, Result } from "@/shared/core/result";

@injectable()
export class PrismaStoreRepository implements StoreRepository {
  constructor(@inject("Logger") private logger: Logger) {}

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
      this.logger.info("order stored in db", { orderId: order.id.toString() });
      return Result.ok(undefined);
    } 
    catch (error) {
      this.logger.error("failed to store order in db", {
        orderId: order.id.toString(),
        error,
      });
      return Result.fail(
        new AppError("STORE_ORDER_FAILED", "failed to store order", {
          orderId: order.id.toString(),
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  async updateOrder(order: Order): Promise<Result<void>> {
    try {
      await prisma.order.update({
        where: { id: order.id.toString() },
        data: {
          statusHistory: order.statusHistory,
          updatedAt: order.updatedAt,
        },
      });

      this.logger.info("order updated in db", { orderId: order.id.toString() });
      return Result.ok(undefined);
    } 
    catch (error) {
      this.logger.error("failed to update order in db", {
        orderId: order.id.toString(),
        error,
      });
      return Result.fail(
        new AppError("UPDATE_ORDER_FAILED", "failed to update order", {
          orderId: order.id.toString(),
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
        this.logger.warn("order not found", { orderId: id });
        return Result.fail(
          new AppError("ORDER_NOT_FOUND", `order with id ${id} not found`, {
            orderId: id,
          })
        );
      }
      const order = Order.create(
        {
          clientId: orderData.clientId,
          statusHistory: orderData.statusHistory as unknown as Array<{ status: Status; updatedAt: Date; }>,
          createdAt: orderData.createdAt,
          updatedAt: orderData.updatedAt,
        },
        new UniqueEntityID(orderData.id)
      );

      this.logger.info("order retrieved from db", { orderId: id });
      return Result.ok(order);
    } 
    catch (error) {
      this.logger.error("failed to get order from db", { orderId: id, error });
      return Result.fail(
        new AppError("GET_ORDER_FAILED", "failed to get order by id", {
          orderId: id,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}
