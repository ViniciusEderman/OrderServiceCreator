import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Order } from "@/domain/order/enterprise/entities/order";
import { AppError, Result } from "@/shared/core/result";
import { InMemoryStoreRepository } from "@/mocks/in-memory-store-repository";
import { Logger } from "@/domain/interfaces/logger";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";
import { makeUpdateOrderStatus, makeOrder } from "@/factories/factories";
import { expectSuccess, expectFailure } from "@/utils/assertions";

describe("UpdateOrderStatus Use Case", () => {
  let storeRepository: InMemoryStoreRepository;
  let updateOrderStatus: UpdateOrderStatus;
  let fakeLogger: Logger;
  let order: Order;

  beforeEach(() => {
    const factory = makeUpdateOrderStatus();
    updateOrderStatus = factory.sut;
    storeRepository = factory.dependencies.storeRepository;
    fakeLogger = factory.dependencies.fakeLogger;
    order = makeOrder({
      id: "ad6409b3-0c27",
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

    const updatedOrder = expectSuccess(result);

    expect(updatedOrder.currentStatus).toBe(newStatus);

    expect(fakeLogger.info).toHaveBeenCalledWith(
      "updating status",
      expect.objectContaining({
        orderId: order.id.toString(),
        newStatus: "accepted",
      })
    );

    expect(fakeLogger.info).toHaveBeenCalledWith(
      "order status updated",
      expect.objectContaining({
        orderId: order.id.toString(),
        newStatus: "accepted",
      })
    );
  });

  it("should fail if order does not exist", async () => {
    const nonExistentId = "non-existent-id";

    const result = await updateOrderStatus.execute({
      orderId: nonExistentId,
      newStatus: "accepted",
    });

    const error = expectFailure(result);

    expect(error.code).toBe("NOT_FOUND");

    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to get order by id",
      expect.objectContaining({
        orderId: nonExistentId,
        error: expect.any(AppError),
      })
    );
  });

  it("should allow updating to the same status (no validation in use case)", async () => {
    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus: "pending",
    });

    expectSuccess(result);
  });

  it("should log and return failure if saving updated order fails", async () => {
    const newStatus = "accepted";
    const mockError = new AppError(
      "UPDATE_ORDER_FAILED",
      "failed to update order in memory"
    );

    const spy = vi
      .spyOn(storeRepository, "updateOrder")
      .mockResolvedValueOnce(Result.fail(mockError));

    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus,
    });

    const error = expectFailure(result, mockError);

    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to save new status on db",
      expect.objectContaining({
        orderId: order.id.toString(),
        error: error,
      })
    );

    spy.mockRestore();
  });

  it("should handle repository getOrderById failure", async () => {
    const mockError = new AppError("GET_ORDER_FAILED", "failed to get order");

    vi.spyOn(storeRepository, "getOrderById").mockResolvedValueOnce(
      Result.fail(mockError)
    );

    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus: "accepted",
    });

    const error = expectFailure(result, mockError);

    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to get order by id",
      expect.objectContaining({
        orderId: order.id.toString(),
        error: error,
      })
    );
  });
});
