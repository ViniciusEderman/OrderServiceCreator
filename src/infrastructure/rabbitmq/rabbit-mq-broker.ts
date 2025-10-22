import { injectable, inject } from "tsyringe";
import amqp, { Connection, Channel } from "amqplib";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { Logger } from "@/domain/interfaces/logger";
import { AppError, Result } from "@/shared/core/result";

@injectable()
export class Rabbit implements IMessageBroker {
  private connection!: Connection;
  private channel!: Channel;
  private url: string = process.env.RABBITMQ_URL || "amqp://localhost";
  private isConnected = false;

  constructor(@inject("Logger") private logger: Logger) {}

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  async connect(retries = 5, delayMs = 2000): Promise<Result<void>> {
    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqp.connect(this.url);
        this.channel = await this.connection.createChannel();
        this.isConnected = true;
        this.logger.info("rabbitmq connected successfully.");

        return Result.ok(undefined);
      } 
      catch (error) {
        this.logger.warn(
          `rabbitmq connection attempt ${
            i + 1
          } failed, retrying in ${delayMs}ms...`,
          {
            error: error instanceof Error ? error.message : String(error),
          }
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    return Result.fail(
      new AppError(
        "BROKER_CONNECTION_FAILED",
        "failed to connect to rabbitmq after retries"
      )
    );
  }

  async publish(queue: string, message: any): Promise<Result<void>> {
    try {
      await this.ensureConnected();
      await this.channel.assertQueue(queue, { durable: true });
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(queue, buffer, { persistent: true });

      this.logger.info("message published to rabbitmq", {
        queue,
        messageId: message.id,
      });
      return Result.ok(undefined);
    } 
    catch (error) {
      this.logger.error("failed to publish message to rabbitmq", {
        queue,
        error: error instanceof Error ? error.message : String(error),
        message,
      });
      return Result.fail(
        new AppError(
          "BROKER_FAILURE",
          "failed to publish message to rabbitmq",
          { queue, message, originalError: error }
        )
      );
    }
  }

  async close(): Promise<Result<void>> {
    try {
      await this.channel.close();
      await this.connection.close();
      this.logger.info("rabbitmq connection closed");
      return Result.ok(undefined);
    } 
    catch (error) {
      this.logger.error("error  closing rabbitmq connection", { error });
      return Result.fail(
        new AppError(
          "BROKER_CLOSE_FAILED",
          "failed to close rabbitmq connection",
          { originalError: error }
        )
      );
    }
  }
}
