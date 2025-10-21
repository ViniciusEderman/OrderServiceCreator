import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";
import { InMemoryStoreRepository } from "@/infrastructure/repositories/mocks/in-memory-store-repository";
import { Logger } from "@/domain/interfaces/logger";
import { Order } from "@/domain/order/enterprise/entities/order";
import { AppError, Result } from "@/shared/core/result";

describe("UpdateOrderStatus Use Case", () => {
  let storeRepository: InMemoryStoreRepository;
  let updateOrderStatus: UpdateOrderStatus;
  let fakeLogger: Logger;
  let order: Order;

  beforeEach(() => {
    storeRepository = new InMemoryStoreRepository();

    fakeLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    updateOrderStatus = new UpdateOrderStatus(storeRepository, fakeLogger);

    order = Order.create({
      clientId: "client-123",
      statusHistory: [{ status: "pending", updatedAt: new Date() }],
      createdAt: new Date(),
    });

    storeRepository.orders.push(order);
    vi.clearAllMocks();
  });

  it("should update order status successfully", async () => {
    const newStatus = "accepted";

    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().currentStatus).toBe(newStatus);
    expect(result.getValue().statusHistory.length).toBe(2);
  });

  it("should fail if order does not exist", async () => {
    const result = await updateOrderStatus.execute({
      orderId: "non-existent-id",
      newStatus: "accepted",
    });

    expect(!result.isSuccess).toBe(true);
    expect(result.getError().code).toBe("NOT_FOUND");
  });

  it("should fail if new status is the same as current", async () => {
    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus: "pending",
    });

    expect(!result.isSuccess).toBe(true);
    expect(result.getError().code).toBe("INVALID_STATUS_CHANGE");
  });

  it("should log and return failure if saving updated order fails", async () => {
    const newStatus = "accepted";

    const spy = vi
      .spyOn(storeRepository, "updateOrder")
      .mockResolvedValueOnce(
        Result.fail(
          new AppError("UPDATE_ORDER_FAILED", "failed to update order")
        )
      );

    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus,
    });

    expect(!result.isSuccess).toBe(true);
    expect(result.getError().code).toBe("UPDATE_ORDER_FAILED");
    
    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to save new status on db",
      expect.objectContaining({
        orderId: order.id.toString(),
        error: expect.any(AppError),
      })
    );

    spy.mockRestore();
  });
});
