import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateOrder } from "@/domain/order/application/use-cases/create-order";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Logger } from "@/domain/interfaces/logger";
import { AppError, Result } from "@/shared/core/result";
import { InMemoryStoreRepository } from "@/infrastructure/repositories/mocks/in-memory-store-repository";


describe("CreateOrder Use Case", () => {
  let storeRepository: InMemoryStoreRepository;
  let createOrder: CreateOrder;

  const fakeLogger: Logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    storeRepository = new InMemoryStoreRepository(fakeLogger);
    createOrder = new CreateOrder(storeRepository, fakeLogger);
  });

  it("should create a successful order if clientId is valid", async () => {
    const clientId = "83f87c4f-5480-41f4-84e7-b624284c272c";

    const result = await createOrder.execute({
      status: "pending",
      clientId,
    });

    expect(result.isSuccess).toBe(true);
    
    const order = result.getValue();
    expect(order).toBeInstanceOf(Order);
    expect(order.currentStatus).toBe("pending");
    expect(order.clientId).toBe(clientId);
    expect(storeRepository.orders).toHaveLength(1);
  });

  it("should handle empty clientId by creating order with empty string", async () => {
    const invalidClientId = "";

    const result = await createOrder.execute({
      status: "pending",
      clientId: invalidClientId,
    });

    expect(result.isSuccess).toBe(true);
    
    const order = result.getValue();
    expect(order.clientId).toBe("");
    expect(storeRepository.orders).toHaveLength(1);
  });

  it("should return failure and log error if storeOrder fails", async () => {
    const mockError = new AppError(
      "STORE_ORDER_FAILED",
      "failed to store order in memory"
    );
    
    vi.spyOn(storeRepository, "storeOrder").mockResolvedValueOnce(
      Result.fail(mockError)
    );

    const result = await createOrder.execute({
      status: "pending",
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
    });

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toEqual(mockError);
    
    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to save order on db",
      expect.objectContaining({
        orderId: expect.any(String),
        error: mockError,
      })
    );
  });

  it("should log info when creating order and on success", async () => {
    const clientId = "83f87c4f-5480-41f4-84e7-b624284c272c";

    const result = await createOrder.execute({
      status: "pending",
      clientId,
    })
    
    expect(fakeLogger.info).toHaveBeenCalledWith(
      "creating order...",
      expect.objectContaining({
        clientId: clientId,
        status: "pending",
      })
    );

    expect(fakeLogger.info).toHaveBeenCalledWith(
      "order created with sucess",
      expect.objectContaining({
        orderId: expect.any(String),
      })
    );
  });
});
