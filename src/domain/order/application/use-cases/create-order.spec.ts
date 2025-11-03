import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Order } from "@/domain/order/enterprise/entities/order";
import { expectFailure, expectSuccess } from "@/utils/assertions";
import { AppError, Result } from "@/shared/core/result";
import { makeCreateOrder, makeFakeOrderDto } from "@/factories/factories";

describe("CreateOrder Use Case", () => {
  let sut: ReturnType<typeof makeCreateOrder>["sut"];

  let storeRepository: ReturnType<
    typeof makeCreateOrder
  >["dependencies"]["storeRepository"];
  
  let fakeLogger: ReturnType<
    typeof makeCreateOrder
  >["dependencies"]["fakeLogger"];

  beforeEach(() => {
    const factory = makeCreateOrder();
    sut = factory.sut;
    storeRepository = factory.dependencies.storeRepository;
    fakeLogger = factory.dependencies.fakeLogger;
  });

  it("should create a successful order if clientId is valid", async () => {
    const input = makeFakeOrderDto();
    const result = await sut.execute(input);
    const order = expectSuccess(result);

    expect(order).toBeInstanceOf(Order);
    expect(order.currentStatus).toBe("pending");
    expect(order.clientId).toBe(input.clientId);
    expect(storeRepository.orders).toHaveLength(1);
  });

  it("should handle empty clientId by creating order with empty string", async () => {
    const input = makeFakeOrderDto({ clientId: "" });
    const result = await sut.execute(input);
    const order = expectSuccess(result);

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

    const result = await sut.execute(makeFakeOrderDto());

    expectFailure(result, mockError);

    expect(fakeLogger.error).toHaveBeenCalledWith(
      "error to save order on db",
      expect.objectContaining({
        orderId: expect.any(String),
        error: mockError,
      })
    );
  });

  it("should log info when creating order and on success", async () => {
    const input = makeFakeOrderDto();

    await sut.execute(input);

    expect(fakeLogger.info).toHaveBeenCalledWith(
      "creating order...",
      expect.objectContaining({
        clientId: input.clientId,
        status: input.status,
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
