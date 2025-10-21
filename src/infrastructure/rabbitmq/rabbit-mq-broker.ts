import { injectable } from 'tsyringe';
import amqp, { Connection, Channel } from "amqplib";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { AppError, Result } from "@/shared/core/result";

@injectable()
export class Rabbit implements IMessageBroker {
  private connection!: Connection;
  private channel!: Channel;
  private url: string;

  constructor(url?: string) {
    this.url = url || process.env.RABBITMQ_URL || "amqp://localhost";
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      console.log("rabbitMQ connected successfully.");
    } catch (error) {
      console.error("error connecting to RabbitMQ:", error);
      throw error;
    }
  }

  async publish(
    queue: string,
    message: any
  ): Promise<Result<void>> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(queue, buffer, { persistent: true });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(
          "BROKER_FAILURE", 
          "Broker error", 
          {
            queue,
            originalError: error instanceof Error ? error.message : String(error),
          }
        )
      );
    }
  }
  
  async close(): Promise<void> {
    try {
      await this.channel.close();
      await this.connection.close();

      console.log("connection to RabbitMQ closed.");
    } catch (error) {
      console.error("error closing RabbitMQ connection:", error);
      throw error;
    }
  }
}