import { Result } from "@/shared/core/result";

export interface IMessageBroker {
  connect(): Promise<void>;
  publish(queue: string, message: any): Promise<Result<void>>;
  close(): Promise<void>;
}
