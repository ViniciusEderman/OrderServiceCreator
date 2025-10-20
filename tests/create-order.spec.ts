import { describe, it, expect, beforeEach, vi } from "vitest";
import { InMemoryStoreRepository } from "@/infrastructure/repositories/mocks/in-memory-store-repository";
import { CreateOrder } from "@/domain/order/application/use-cases/create-order";
import { Logger } from "@/domain/interfaces/logger";

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
    storeRepository = new InMemoryStoreRepository();
    createOrder = new CreateOrder(storeRepository, fakeLogger);
  });

  it("should create a successful order if clientId is valid", async () => {
    const clientId = "83f87c4f-5480-41f4-84e7-b624284c272c";

    const result = await createOrder.execute({
      status: "pending",
      clientId,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().currentStatus).toBe("pending");
    expect(storeRepository.orders).toHaveLength(1);
  });

  it("should return failure if clientId is missing or invalid", async () => {
    const invalidClientId = "";

    const result = await createOrder.execute({
      status: "pending",
      clientId: invalidClientId,
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe("INVALID_CLIENT_ID");
  });
});
