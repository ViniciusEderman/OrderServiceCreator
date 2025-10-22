import "reflect-metadata"
import { describe, it, beforeEach, expect, vi } from "vitest";
import { CreateAndPublishOrder } from "@/domain/order/application/use-cases/order-orchestrator";
import { Result, AppError } from "@/shared/core/result";

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

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
      mockLogger as any,
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
    expect(mockCreateOrder.execute).toHaveBeenCalledWith({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending",
    });
    expect(mockPublisherOrder.publish).toHaveBeenCalledTimes(1);
    expect(mockPublisherOrder.publish).toHaveBeenCalledWith(fakeOrder);
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(fakeOrder);
  });

  it("should fail if order creation fails", async () => {
    const error = new AppError("CREATE_FAIL", "failed to create order");

    mockCreateOrder.execute.mockResolvedValue(Result.fail(error));

    const result = await createAndPublishOrder.execute({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending",
    });

    expect(mockCreateOrder.execute).toHaveBeenCalledTimes(1);
    expect(mockPublisherOrder.publish).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe(error);
  });

  it("should fail if publishing fails", async () => {
    const fakeOrder = { 
      id: "ad6409b3", 
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c", 
      status: "pending" 
    };
    const error = new AppError("PUBLISH_FAIL", "failed to publish order");

    mockCreateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
    mockPublisherOrder.publish.mockResolvedValue(Result.fail(error));

    const result = await createAndPublishOrder.execute({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending",
    });

    expect(mockCreateOrder.execute).toHaveBeenCalled();
    expect(mockPublisherOrder.publish).toHaveBeenCalled();
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe(error);
  });
});