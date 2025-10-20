import { inject, injectable } from "tsyringe";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Status } from "@/domain/order/enterprise/types/status";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Logger } from "@/domain/interfaces/logger";
import { DomainError, Result } from "@/shared/core/result";

type CreateOrderUseCaseResponse = Result<Order, DomainError>;

export interface CreateOrderUseCaseRequest {
  status: Status;
  clientId: String;
}

@injectable()
export class CreateOrder {
  constructor(
    @inject("StoreRepository") private storeRepository: StoreRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute({
    status,
    clientId,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
      this.logger.info("invalid or empty clientId", { clientId });

      return Result.fail(
        new DomainError(
          "INVALID_CLIENT_ID",
          "the clientId is required and must be a non-empty string",
          { clientId }
        )
      );
    }

    const order = Order.create({
      clientId,
      statusHistory: [
        {
          status,
          updatedAt: new Date(),
        },
      ],
    });

    const storeOrderResult = await this.storeRepository.storeOrder(order);

    if (storeOrderResult.isFailure) {
      this.logger.error("error to save order on db", {
        orderId: order.id.toString(),
        error: storeOrderResult.getError(),
      });

      return Result.fail(storeOrderResult.getError());
    }

    this.logger.info("order created with sucess", {
      orderId: order.id.toString(),
    });

    return Result.ok(order);
  }
}
