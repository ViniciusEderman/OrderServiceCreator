import "reflect-metadata"
import { describe, it, expect, beforeEach, vi } from "vitest";
import { PublisherOrder } from "@/domain/order/application/use-cases/publisher-order";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { Logger } from "@/domain/interfaces/logger";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Result, AppError } from "@/shared/core/result";

const fakeLogger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const fakeMessageBroker: IMessageBroker = {
  connect: vi.fn(),
  close: vi.fn(),
  publish: vi.fn(),
};

describe("PublisherOrder Use Case", () => {
  let publisher: PublisherOrder;
  let order: Order;

  beforeEach(() => {
    publisher = new PublisherOrder(fakeLogger, fakeMessageBroker as any);
    order = Order.create({
      clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
      statusHistory: [{ status: "pending", updatedAt: new Date() }],
    });

    vi.clearAllMocks();
  });

  it("should publish the order successfully", async () => {
    (fakeMessageBroker.publish as any).mockResolvedValue(
      Result.ok(undefined)
    );

    const result = await publisher.publish(order);

    expect(result.isSuccess).toBe(true);
    expect(fakeMessageBroker.publish).toHaveBeenCalledWith("orders", order);
    
    expect(fakeLogger.info).toHaveBeenCalledWith(
      "publishing order...",
      expect.objectContaining({ orderId: order.id.toString() })
    );
    expect(fakeLogger.info).toHaveBeenCalledWith(
      "order published successfully",
      expect.objectContaining({ orderId: order.id.toString() })
    );
  });

  it("should return failure if broker.publish fails", async () => {
    const fakeError = new AppError("BROKER_FAILURE", "failed to publish message to rabbitmq");

    (fakeMessageBroker.publish as any).mockResolvedValue(
      Result.fail(fakeError)
    );

    const result = await publisher.publish(order);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toEqual(fakeError);
    expect(fakeLogger.error).toHaveBeenCalledWith(
      "failed to publish order",
      expect.objectContaining({ 
        orderId: order.id.toString(),
        error: fakeError 
      })
    );
  });

  it("should handle broker connection issues", async () => {
    const connectionError = new AppError("BROKER_CONNECTION_FAILED", "failed to connect to rabbitmq");

    (fakeMessageBroker.publish as any).mockResolvedValue(
      Result.fail(connectionError)
    );

    const result = await publisher.publish(order);

    expect(result.isSuccess).toBe(false);
    expect(result.getError().code).toBe("BROKER_CONNECTION_FAILED");
  });
});