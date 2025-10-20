import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";
import { IMessageBroker } from "../../domain/interfaces/message-broker";
import { InfraError, Result } from "@/shared/core/result";

export class Rabbit implements IMessageBroker {
  private connection!: Connection;
  private channel!: Channel;
  private url: string;

  constructor(url?: string) {
    this.url = url || process.env.RABBITMQ_URL || "amqp://localhost";
  }

  async connect(): Promise<void> {
    try {
      this.connection = (await amqp.connect(this.url)) as unknown as Connection;
      this.channel = await this.connection.createChannel();

      console.log("RabbitMQ conectado com sucesso.");
    } catch (error) {
      console.error("Erro ao conectar no RabbitMQ:", error);
      throw error;
    }
  }

  async publish(
    queue: string,
    message: any
  ): Promise<Result<void, InfraError>> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(queue, buffer, { persistent: true });

      return Result.ok<void, InfraError>(undefined);
    } catch (error) {
      return Result.fail<void, InfraError>(
        new InfraError("BROKER_FAILURE", "Erro no broker", {
          queue,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
  
  async close(): Promise<void> {
    try {
      await this.channel.close();
      await this.connection.close();

      console.log("Conexão com RabbitMQ fechada.");
    } catch (error) {
      console.error("Erro ao fechar conexão RabbitMQ:", error);

      throw error;
    }
  }
}
