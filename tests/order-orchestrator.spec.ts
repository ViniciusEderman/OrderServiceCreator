import "reflect-metadata";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { OrderOrchestrator } from "@/domain/order/application/use-cases/order-orchestrator";
import { Result, AppError } from "@/shared/core/result";

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

const mockCreateOrder = {
  execute: vi.fn(),
};

const mockPublisherOrder = {
  publish: vi.fn(),
};

const mockUpdateOrder = {
  execute: vi.fn(),
};

describe("CreateAndPublishOrder Use Case", () => {
  let createAndPublishOrder: OrderOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    createAndPublishOrder = new OrderOrchestrator(
      mockLogger as any,
      mockCreateOrder as any,
      mockPublisherOrder as any,
      mockUpdateOrder as any
    );
  });

  it("should create and publish an order successfully", async () => {
    const fakeOrder = {
      id: "ad6409b3-0c27",
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending",
    };

    mockCreateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
    mockPublisherOrder.publish.mockResolvedValue(Result.ok(undefined));

    const result = await createAndPublishOrder.createOrderAndPublisher({
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

    const result = await createAndPublishOrder.createOrderAndPublisher({
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
      status: "pending",
    };
    const error = new AppError("PUBLISH_FAIL", "failed to publish order");

    mockCreateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
    mockPublisherOrder.publish.mockResolvedValue(Result.fail(error));

    const result = await createAndPublishOrder.createOrderAndPublisher({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending",
    });

    expect(mockCreateOrder.execute).toHaveBeenCalled();
    expect(mockPublisherOrder.publish).toHaveBeenCalled();
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe(error);
  });

  describe("UpdateAndPublishOrder Use Case", () => {
    it("should update and publish an order successfully", async () => {
      const fakeOrder = { id: "ad6409b3", status: "accepted" };

      mockUpdateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
      mockPublisherOrder.publish.mockResolvedValue(Result.ok(undefined));

      const result = await createAndPublishOrder.updateOrderAndPublisher({
        orderId: "ad6409b3",
        newStatus: "accepted",
      });

      expect(mockUpdateOrder.execute).toHaveBeenCalledTimes(1);
      expect(mockUpdateOrder.execute).toHaveBeenCalledWith({
        orderId: "ad6409b3",
        newStatus: "accepted",
      });
      expect(mockPublisherOrder.publish).toHaveBeenCalledTimes(1);
      expect(mockPublisherOrder.publish).toHaveBeenCalledWith(fakeOrder);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(fakeOrder);
    });

    it("should fail if update fails", async () => {
      const error = new AppError("UPDATE_FAIL", "failed to update order");

      mockUpdateOrder.execute.mockResolvedValue(Result.fail(error));

      const result = await createAndPublishOrder.updateOrderAndPublisher({
        orderId: "ad6409b3",
        newStatus: "accepted",
      });

      expect(mockUpdateOrder.execute).toHaveBeenCalledTimes(1);
      expect(mockPublisherOrder.publish).not.toHaveBeenCalled();
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe(error);
    });

    it("should fail if publishing fails", async () => {
      const fakeOrder = { id: "ad6409b3", status: "accepted" };
      const error = new AppError("PUBLISH_FAIL", "failed to publish order");

      mockUpdateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
      mockPublisherOrder.publish.mockResolvedValue(Result.fail(error));

      const result = await createAndPublishOrder.updateOrderAndPublisher({
        orderId: "ad6409b3",
        newStatus: "accepted",
      });

      expect(mockUpdateOrder.execute).toHaveBeenCalled();
      expect(mockPublisherOrder.publish).toHaveBeenCalled();
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe(error);
    });
  });
});
