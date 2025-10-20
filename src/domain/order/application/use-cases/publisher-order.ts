import { inject, injectable } from "tsyringe";
import { Logger } from "@/domain/interfaces/logger";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { Order } from "@/domain/order/enterprise/entities/order";
import { DomainError, Result } from "@/shared/core/result";

type PublishResult = Result<void, DomainError>;

@injectable()
export class PublisherOrder {
  constructor(
    @inject("Logger") private logger: Logger,
    @inject("MessageBroker") private messageBroker: IMessageBroker
  ) {}

  async publish(order: Order): Promise<PublishResult> {
    this.logger.info("publishing order...", {
      orderId: order.id.toString(),
    });

    const publishResult = await this.messageBroker.publish("orders", order);

    if (publishResult.isFailure) {
      this.logger.error("failed to publish order", {
        orderId: order.id.toString(),
      });

      return Result.fail<void, DomainError>(
        new DomainError(
          "PUBLICATION_FAILURE",
          "the system failed to finalize the order publication process.",
          {
            orderId: order.id.toString(),
            originalError: publishResult.getError(),
          }
        )
      );
    }
    this.logger.info("order published successfully", {
      orderId: order.id.toString(),
    });

    return Result.ok<void, DomainError>(undefined);
  }
}
