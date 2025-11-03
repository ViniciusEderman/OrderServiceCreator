import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { PublisherOrder } from "@/domain/order/application/use-cases/publisher-order";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Logger } from "@/domain/interfaces/logger";
import { Result, AppError } from "@/shared/core/result";
import { makePublisherOrder, makeFakeOrderDto } from "@/factories/factories"; 
import { expectFailure, expectVoidSuccess } from "@/utils/assertions"; 

describe("PublisherOrder Use Case", () => {
  let publisher: PublisherOrder;
  let order: Order;
  let fakeMessageBroker: IMessageBroker;
  let fakeLogger: Logger;

  beforeEach(() => {
    const factory = makePublisherOrder();
    publisher = factory.sut;
    fakeMessageBroker = factory.dependencies.fakeMessageBroker;
    fakeLogger = factory.dependencies.fakeLogger;
    order = makeFakeOrderDto();

    vi.clearAllMocks();
  });

  it("should publish the order successfully", async () => {
    (fakeMessageBroker.publish as any).mockResolvedValue(
      Result.ok(undefined)
    );

    const result = await publisher.publish(order);
    expectVoidSuccess(result);

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
    const error = expectFailure(result, fakeError); 

    expect(fakeLogger.error).toHaveBeenCalledWith(
      "failed to publish order",
      expect.objectContaining({ 
        orderId: order.id.toString(),
        error: error 
      })
    );
  });

  it("should handle broker connection issues", async () => {
    const connectionError = new AppError("BROKER_CONNECTION_FAILED", "failed to connect to rabbitmq");

    (fakeMessageBroker.publish as any).mockResolvedValue(
      Result.fail(connectionError)
    );

    const result = await publisher.publish(order);
    const error = expectFailure(result);

    expect(error.code).toBe("BROKER_CONNECTION_FAILED");
  });
});
