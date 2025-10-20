import "reflect-metadata"
import { describe, it, beforeEach, expect, vi } from "vitest";
import { CreateAndPublishOrder } from "@/domain/order/application/use-cases/order-orchestrator";
import { Result } from "@/shared/core/result";
import { DomainError } from "@/shared/core/result";

const mockCreateOrder = {
  execute: vi.fn(),
};

const mockPublisherOrder = {
  publish: vi.fn(),
};

describe("CreateAndPublishOrder Use Case", () => {
  let createAndPublishOrder: CreateAndPublishOrder;

  beforeEach(() => {
    vi.clearAllMocks();
    createAndPublishOrder = new CreateAndPublishOrder(
      mockCreateOrder as any,
      mockPublisherOrder as any
    );
  });

  it("should create and publish an order successfully", async () => {
    const fakeOrder = { 
        id: "ad6409b3-0c27",
        clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
        status: "pending" 
    };

    mockCreateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
    mockPublisherOrder.publish.mockResolvedValue(Result.ok(undefined));

    const result = await createAndPublishOrder.execute({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending",
    });

    expect(mockCreateOrder.execute).toHaveBeenCalledTimes(1);
    expect(mockPublisherOrder.publish).toHaveBeenCalledTimes(1);
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(fakeOrder);
  });

  it("should fail if order creation fails", async () => {
    const error = new DomainError("CREATE_FAIL", "Failed to create order");

    mockCreateOrder.execute.mockResolvedValue(Result.fail(error));

    const result = await createAndPublishOrder.execute({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending",
    });

    expect(mockPublisherOrder.publish).not.toHaveBeenCalled();
    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBe(error);
  });

  it("should fail if publishing fails", async () => {
    const fakeOrder = { id: "ad6409b3", clientId: "83f87c4f-5480-41f4-84e7-b624284c272c", status: "pending" };
    const error = new DomainError("PUBLISH_FAIL", "Failed to publish order");

    mockCreateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
    mockPublisherOrder.publish.mockResolvedValue(Result.fail(error));

    const result = await createAndPublishOrder.execute({
      clientId: "abc",
      status: "pending",
    });

    expect(mockCreateOrder.execute).toHaveBeenCalled();
    expect(mockPublisherOrder.publish).toHaveBeenCalled();
    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBe(error);
  });
});
