import { injectable } from 'tsyringe';
import amqp, { Connection, Channel } from "amqplib";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { AppError, Result } from "@/shared/core/result";

@injectable()
export class Rabbit implements IMessageBroker {
  private connection!: Connection;
  private channel!: Channel;
  private url: string = process.env.RABBITMQ_URL || "amqp://localhost"
  private isConnected = false;

  constructor() {
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  async connect(retries = 5, delayMs = 2000): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqp.connect(this.url);
        this.channel = await this.connection.createChannel();
        this.isConnected = true;
        console.log("mq connected successfully.");
        return;
      } catch (error) {
        console.log(`retry ${i + 1}/${retries} failed. waiting ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    throw new Error("failed to connect to RabbitMQ after retries.");
  }

  async publish(
    queue: string,
    message: any
  ): Promise<Result<void>> {
    try {
      await this.ensureConnected();
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