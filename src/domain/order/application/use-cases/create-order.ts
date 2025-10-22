import { inject, injectable } from "tsyringe";
import { StoreRepository } from "@/domain/interfaces/store-repository";
import { Status } from "@/domain/order/enterprise/types/status";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Logger } from "@/domain/interfaces/logger";
import { Result } from "@/shared/core/result";

type CreateOrderUseCaseResponse = Result<Order>;

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
    this.logger.info("creating order...", {
      clientId: clientId,
      status: status,
    });

    const order = Order.create({
      clientId: String(clientId),
      statusHistory: [
        {
          status,
          updatedAt: new Date(),
        },
      ],
    });

    const storeOrderResult = await this.storeRepository.storeOrder(order);

    if (!storeOrderResult.isSuccess) {
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
