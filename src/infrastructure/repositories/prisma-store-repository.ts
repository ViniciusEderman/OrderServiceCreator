import { injectable, inject } from "tsyringe";
import { prisma } from "@/infrastructure/db/prisma";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Logger } from "@/domain/interfaces/logger";
import { AppError, Result } from "@/shared/core/result";
import { OrderPresenter } from "@/infrastructure/http/presenters/order-presenter";

@injectable()
export class PrismaStoreRepository implements StoreRepository {
  constructor(@inject("Logger") private logger: Logger) {}

  async storeOrder(order: Order): Promise<Result<void>> {
    try {
      await prisma.order.create({
        data: OrderPresenter.toPersistence(order),
      });

      this.logger.info("order stored in db", { orderId: order.id.toString() });
      return Result.ok(undefined);
    } catch (error) {
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
        data: OrderPresenter.toUpdatePersistence(order),
      });

      this.logger.info("order updated in db", { orderId: order.id.toString() });
      return Result.ok(undefined);
    } catch (error) {
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

      const order = OrderPresenter.toDomain(orderData);
      this.logger.info("order retrieved from db", { orderId: id });
      return Result.ok(order);
    } catch (error) {
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
