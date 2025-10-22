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
    fakeLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    storeRepository = new InMemoryStoreRepository(fakeLogger);
    updateOrderStatus = new UpdateOrderStatus(storeRepository, fakeLogger);

    order = Order.create({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      statusHistory: [{ status: "pending", updatedAt: new Date() }],
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
    
    const updatedOrder = result.getValue();
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
    const result = await updateOrderStatus.execute({
      orderId: "non-existent-id",
      newStatus: "accepted",
    });

    expect(result.isSuccess).toBe(false);
    expect(result.getError().code).toBe("NOT_FOUND");
    
    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to get order by id",
      expect.objectContaining({
        orderId: "non-existent-id",
        error: expect.any(AppError),
      })
    );
  });

  it("should allow updating to the same status (no validation in use case)", async () => {
    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus: "pending",
    });

    expect(result.isSuccess).toBe(true);
  });

  it("should log and return failure if saving updated order fails", async () => {
    const newStatus = "accepted";

    const mockError = new AppError("UPDATE_ORDER_FAILED", "failed to update order in memory");
    
    const spy = vi
      .spyOn(storeRepository, "updateOrder")
      .mockResolvedValueOnce(Result.fail(mockError));

    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus,
    });

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toEqual(mockError);
    
    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to save new status on db",
      expect.objectContaining({
        orderId: order.id.toString(),
        error: mockError,
      })
    );

    spy.mockRestore();
  });

  it("should handle repository getOrderById failure", async () => {
    const mockError = new AppError("GET_ORDER_FAILED", "failed to get order");
    
    vi.spyOn(storeRepository, "getOrderById")
      .mockResolvedValueOnce(Result.fail(mockError));

    const result = await updateOrderStatus.execute({
      orderId: order.id.toString(),
      newStatus: "accepted",
    });

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toEqual(mockError);
    
    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to get order by id",
      expect.objectContaining({
        orderId: order.id.toString(),
        error: mockError,
      })
    );
  });
});