import "reflect-metadata";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Status } from "@/domain/order/enterprise/types/status";
import { OrderOrchestrator } from "@/domain/order/application/use-cases/order-orchestrator";
import { Result, AppError } from "@/shared/core/result";
import { makeOrderOrchestrator, makeFakeOrderDto } from "@/factories/factories";
import {
  expectFailure,
  expectSuccess,
} from "@/utils/assertions";

describe("OrderOrchestrator Use Case", () => {
  let createAndPublishOrder: OrderOrchestrator;
  let mockCreateOrder: { execute: Mock };
  let mockPublisherOrder: { publish: Mock };
  let mockUpdateOrder: { execute: Mock };

  beforeEach(() => {
    vi.clearAllMocks();

    const factory = makeOrderOrchestrator();
    createAndPublishOrder = factory.sut;
    mockCreateOrder = factory.dependencies.mockCreateOrder;
    mockPublisherOrder = factory.dependencies.mockPublisherOrder;
    mockUpdateOrder = factory.dependencies.mockUpdateOrder;
  });

  it("should create and publish an order successfully", async () => {
    const fakeOrder = makeFakeOrderDto({ status: "pending" }); 
    const input = { clientId: fakeOrder.clientId, status: fakeOrder.status };

    mockCreateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
    mockPublisherOrder.publish.mockResolvedValue(Result.ok(undefined));

    const result = await createAndPublishOrder.createOrderAndPublisher(input);

    expect(mockCreateOrder.execute).toHaveBeenCalledWith(input);
    expect(mockPublisherOrder.publish).toHaveBeenCalledWith(fakeOrder);
    expectSuccess(result);
    expect(result.getValue()).toEqual(fakeOrder);
  });

  it("should fail if order creation fails", async () => {
    const input = {
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      status: "pending" as Status,
    };
    const error = new AppError("CREATE_FAIL", "failed to create order");

    mockCreateOrder.execute.mockResolvedValue(Result.fail(error));

    const result = await createAndPublishOrder.createOrderAndPublisher(input);

    expectFailure(result, error);

    expect(mockCreateOrder.execute).toHaveBeenCalledWith(input);
    expect(mockPublisherOrder.publish).not.toHaveBeenCalled();
  });

  it("should fail if publishing fails", async () => {
    const fakeOrder = makeFakeOrderDto({ id: "ad6409b3" });
    const input = { clientId: fakeOrder.clientId, status: fakeOrder.status };
    const error = new AppError("PUBLISH_FAIL", "failed to publish order");

    mockCreateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
    mockPublisherOrder.publish.mockResolvedValue(Result.fail(error));

    const result = await createAndPublishOrder.createOrderAndPublisher(input);
    expectFailure(result, error);

    expect(mockCreateOrder.execute).toHaveBeenCalled();
    expect(mockPublisherOrder.publish).toHaveBeenCalled();
  });

  describe("UpdateAndPublishOrder Use Case", () => {
    it("should update and publish an order successfully", async () => {
      const fakeOrder = makeFakeOrderDto({
        id: "ad6409b3",
        status: "accepted",
      });
      const input = { orderId: fakeOrder.id, newStatus: "accepted" as Status };

      mockUpdateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
      mockPublisherOrder.publish.mockResolvedValue(Result.ok(undefined));

      const result = await createAndPublishOrder.updateOrderAndPublisher(input);

      expect(mockUpdateOrder.execute).toHaveBeenCalledWith(input);
      expect(mockPublisherOrder.publish).toHaveBeenCalledWith(fakeOrder);
      expectSuccess(result);
      expect(result.getValue()).toEqual(fakeOrder);
    });

    it("should fail if update fails", async () => {
      const input = { orderId: "ad6409b3", newStatus: "accepted" as Status };
      const error = new AppError("UPDATE_FAIL", "failed to update order");

      mockUpdateOrder.execute.mockResolvedValue(Result.fail(error));

      const result = await createAndPublishOrder.updateOrderAndPublisher(input);
      expectFailure(result, error);
      expect(mockUpdateOrder.execute).toHaveBeenCalledWith(input);
      expect(mockPublisherOrder.publish).not.toHaveBeenCalled();
    });

    it("should fail if publishing fails", async () => {
      const fakeOrder = makeFakeOrderDto({
        id: "ad6409b3",
        status: "accepted",
      });
      const input = { orderId: fakeOrder.id, newStatus: fakeOrder.status };
      const error = new AppError("PUBLISH_FAIL", "failed to publish order");

      mockUpdateOrder.execute.mockResolvedValue(Result.ok(fakeOrder));
      mockPublisherOrder.publish.mockResolvedValue(Result.fail(error));

      const result = await createAndPublishOrder.updateOrderAndPublisher(input);

      expectFailure(result, error);
      expect(mockUpdateOrder.execute).toHaveBeenCalled();
      expect(mockPublisherOrder.publish).toHaveBeenCalled();
    });
  });
});
